import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, FlatList, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../context/auth-context';
import { getFoods } from '../../services/data/foods';
import { 
  getLikesCount, 
  getSavesCount, 
  getCommentsCount, 
  createLike, 
  deleteLike, 
  createSave, 
  deleteSave,
  checkUserLiked,
  checkUserSaved
} from '../../services/data/forum';
import { getProfile } from '../../services/data/profile';
import { Food, Profile } from '../../types/index';
import { supabase } from '../../services/supabase';

// Categories for filtering
const categories = [
  { id: 'main', name: 'Main dish' },
  { id: 'dessert', name: 'Dessert' },
  { id: 'appetizer', name: 'Appetite' },
];

// Sort options
const sortOptions = [
  { id: 'rating', name: 'Rating', icon: 'star' },
  { id: 'newest', name: 'Newest', icon: 'calendar' },
  { id: 'best', name: 'Best', icon: 'fire' },
];

export default function ForumScreen() {
  const { isAuthenticated } = useAuth();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSort, setSelectedSort] = useState('rating');
  const [foodStats, setFoodStats] = useState<{[key: string]: {likes: number, saves: number, comments: number}}>({});
  const [foodCreators, setFoodCreators] = useState<{[key: string]: Profile}>({});
  const [userInteractions, setUserInteractions] = useState<{[key: string]: {liked: boolean, saved: boolean}}>({});
  
  // Get current user ID from Supabase session
  useEffect(() => {
    async function getCurrentUser() {
      if (isAuthenticated) {
        const { data } = await supabase.auth.getSession();
        const userId = data.session?.user?.id;
        console.log('Current user ID:', userId);
        setCurrentUserId(userId || null);
      } else {
        setCurrentUserId(null);
      }
    }
    
    getCurrentUser();
  }, [isAuthenticated]);
  
  // Set up real-time subscription for likes and saves
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const likesSubscription = supabase
      .channel('food_likes_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'food_likes'
      }, () => {
        // Refresh stats when changes occur
        loadFoods();
      })
      .subscribe();
      
    const savesSubscription = supabase
      .channel('food_saves_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'food_saves'
      }, () => {
        // Refresh stats when changes occur
        loadFoods();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(likesSubscription);
      supabase.removeChannel(savesSubscription);
    };
  }, [isAuthenticated]);
  
  useEffect(() => {
    loadFoods();
  }, [selectedCategory, selectedSort, currentUserId]);
  
  const loadFoods = async () => {
    setLoading(true);
    try {
      // In a real app, you would filter by category and sort accordingly
      const { data, error } = await getFoods(undefined, true, searchQuery);
      
      if (error) {
        console.error('Error loading foods:', error);
        return;
      }
      
      if (data) {
        // Sort data based on selectedSort
        let sortedData = [...data];
        if (selectedSort === 'rating') {
          // Assuming higher calories means higher rating for demo purposes
          sortedData.sort((a, b) => (b.calories ?? 0) - (a.calories ?? 0));
        } else if (selectedSort === 'newest') {
          sortedData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        } else if (selectedSort === 'best') {
          // Assuming higher ingredient_count means better for demo purposes
          sortedData.sort((a, b) => (b.ingredient_count ?? 0) - (a.ingredient_count ?? 0));
        }
        
        setFoods(sortedData.map(food => ({
          ...food,
          description: food.description || '', // Ensure description is always a string
          ingredient_count: food.ingredient_count ?? 0, // Ensure ingredient_count is always a number
          calories: food.calories ?? 0, // Ensure calories is always a number
          image_url: food.image_url || '', // Ensure image_url is always a string
        })));
        
        // Load stats for each food
        const statsPromises = sortedData.map(async (food) => {
          const [likesRes, savesRes, commentsRes] = await Promise.all([
            getLikesCount(food.id),
            getSavesCount(food.id),
            getCommentsCount(food.id)
          ]);
          
          return {
            foodId: food.id,
            likes: likesRes.count || 0,
            saves: savesRes.count || 0,
            comments: commentsRes.count || 0
          };
        });
        
        const stats = await Promise.all(statsPromises);
        const statsMap = stats.reduce((acc, stat) => {
          acc[stat.foodId] = {
            likes: stat.likes,
            saves: stat.saves,
            comments: stat.comments
          };
          return acc;
        }, {} as {[key: string]: {likes: number, saves: number, comments: number}});
        
        setFoodStats(statsMap);
        
        // Load creator profiles
        const creatorIds = sortedData
          .filter(food => food.created_by)
          .map(food => food.created_by as string);
        
        const uniqueCreatorIds = [...new Set(creatorIds)];
        
        const creatorProfiles: {[key: string]: Profile} = {};
        
        for (const creatorId of uniqueCreatorIds) {
          const { data: profile } = await getProfile(creatorId);
          if (profile) {
            creatorProfiles[creatorId] = profile;
          }
        }
        
        setFoodCreators(creatorProfiles);
        
        // Check user interactions if authenticated
        if (isAuthenticated && currentUserId) {
          const interactionsPromises = sortedData.map(async (food) => {
            const [likedRes, savedRes] = await Promise.all([
              checkUserLiked(food.id, currentUserId),
              checkUserSaved(food.id, currentUserId)
            ]);
            
            return {
              foodId: food.id,
              liked: !!likedRes.data,
              saved: !!savedRes.data
            };
          });
          
          const interactions = await Promise.all(interactionsPromises);
          const interactionsMap = interactions.reduce((acc, interaction) => {
            acc[interaction.foodId] = {
              liked: interaction.liked,
              saved: interaction.saved
            };
            return acc;
          }, {} as {[key: string]: {liked: boolean, saved: boolean}});
          
          setUserInteractions(interactionsMap);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    // Debounce search for better performance
    setTimeout(() => {
      loadFoods();
    }, 500);
  };
  
const navigateToPostDetail = (food: Food) => {
  router.push(`/post-detail/${food.id}`);
};
  
  const handleLike = async (food: Food) => {
    if (!isAuthenticated || !currentUserId) {
      Alert.alert('Authentication Required', 'Please log in to like posts.');
      return;
    }
    
    try {
      const isLiked = userInteractions[food.id]?.liked || false;
      
      // Optimistically update UI
      setUserInteractions(prev => ({
        ...prev,
        [food.id]: {
          ...prev[food.id],
          liked: !isLiked
        }
      }));
      
      setFoodStats(prev => ({
        ...prev,
        [food.id]: {
          ...prev[food.id],
          likes: isLiked ? Math.max(0, prev[food.id].likes - 1) : prev[food.id].likes + 1
        }
      }));
      
      if (isLiked) {
        const { error } = await deleteLike(food.id, currentUserId);
        if (error) {
          console.error('Error deleting like:', error);
          // Revert optimistic update if there's an error
          setUserInteractions(prev => ({
            ...prev,
            [food.id]: {
              ...prev[food.id],
              liked: true
            }
          }));
          
          setFoodStats(prev => ({
            ...prev,
            [food.id]: {
              ...prev[food.id],
              likes: prev[food.id].likes + 1
            }
          }));
          
          Alert.alert('Error', 'Failed to unlike. Please try again.');
        }
      } else {
        const { error } = await createLike(food.id, currentUserId);
        if (error) {
          console.error('Error creating like:', error);
          // Revert optimistic update if there's an error
          setUserInteractions(prev => ({
            ...prev,
            [food.id]: {
              ...prev[food.id],
              liked: false
            }
          }));
          
          setFoodStats(prev => ({
            ...prev,
            [food.id]: {
              ...prev[food.id],
              likes: Math.max(0, prev[food.id].likes - 1)
            }
          }));
          
          Alert.alert('Error', 'Failed to like. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Error', 'Failed to update like. Please try again.');
    }
  };
  
  const handleSave = async (food: Food) => {
    if (!isAuthenticated || !currentUserId) {
      Alert.alert('Authentication Required', 'Please log in to save posts.');
      return;
    }
    
    try {
      const isSaved = userInteractions[food.id]?.saved || false;
      
      // Optimistically update UI
      setUserInteractions(prev => ({
        ...prev,
        [food.id]: {
          ...prev[food.id],
          saved: !isSaved
        }
      }));
      
      setFoodStats(prev => ({
        ...prev,
        [food.id]: {
          ...prev[food.id],
          saves: isSaved ? Math.max(0, prev[food.id].saves - 1) : prev[food.id].saves + 1
        }
      }));
      
      if (isSaved) {
        const { error } = await deleteSave(food.id, currentUserId);
        if (error) {
          console.error('Error deleting save:', error);
          // Revert optimistic update if there's an error
          setUserInteractions(prev => ({
            ...prev,
            [food.id]: {
              ...prev[food.id],
              saved: true
            }
          }));
          
          setFoodStats(prev => ({
            ...prev,
            [food.id]: {
              ...prev[food.id],
              saves: prev[food.id].saves + 1
            }
          }));
          
          Alert.alert('Error', 'Failed to unsave. Please try again.');
        }
      } else {
        const { error } = await createSave(food.id, currentUserId);
        if (error) {
          console.error('Error creating save:', error);
          // Revert optimistic update if there's an error
          setUserInteractions(prev => ({
            ...prev,
            [food.id]: {
              ...prev[food.id],
              saved: false
            }
          }));
          
          setFoodStats(prev => ({
            ...prev,
            [food.id]: {
              ...prev[food.id],
              saves: Math.max(0, prev[food.id].saves - 1)
            }
          }));
          
          Alert.alert('Error', 'Failed to save. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      Alert.alert('Error', 'Failed to update save. Please try again.');
    }
  };
  
  const renderFoodItem = ({ item }: { item: Food }) => {
    // Get stats for this food
    const stats = foodStats[item.id] || { likes: 0, saves: 0, comments: 0 };
    
    // Get creator profile
    const creator = item.created_by ? foodCreators[item.created_by] : null;
    
    // Get user interactions
    const interactions = userInteractions[item.id] || { liked: false, saved: false };
    
    return (
      <TouchableOpacity 
        className="mb-6 bg-white rounded-lg overflow-hidden shadow-sm"
        onPress={() => navigateToPostDetail(item)}
      >
        <View className="p-4">
          {/* User info and rating */}
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                {creator?.avatar_url ? (
                  <Image 
                    source={{ uri: creator.avatar_url }}
                    className="w-full h-full"
                  />
                ) : (
                  <View className="w-full h-full bg-gray-300 items-center justify-center">
                    <Text className="text-base font-bold text-gray-600">
                      {creator?.username?.charAt(0).toUpperCase() || '?'}
                    </Text>
                  </View>
                )}
              </View>
              <Text className="ml-3 text-lg font-bold">
                {creator?.username || creator?.full_name || 'Unknown Chef'}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-lg font-bold mr-1">4.2</Text>
              <FontAwesome name="star" size={20} color="#ffd60a" />
            </View>
          </View>
          
          {/* Food image */}
          <View className="rounded-lg overflow-hidden mb-4">
            <Image 
              source={{ uri: item.image_url || "/placeholder.svg?height=300&width=500&query=food dish" }}
              className="w-full h-48"
              resizeMode="cover"
            />
          </View>
          
          {/* Food title and description */}
          <View>
            <Text className="text-2xl font-bold mb-2">{item.name}</Text>
            <Text className="text-gray-700 mb-4">{item.description}</Text>
          </View>
          
          {/* Interaction buttons */}
          <View className="flex-row justify-between">
            <View className="flex-row items-center">
              <TouchableOpacity 
                className="flex-row items-center mr-6"
                onPress={(e) => {
                  e.stopPropagation();
                  handleLike(item);
                }}
              >
                <Feather 
                  name="heart" 
                  size={22} 
                  color={interactions.liked ? "#E91E63" : "#333"} 
                />
                <Text className="ml-2 text-lg">{stats.likes}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="flex-row items-center mr-6"
                onPress={() => navigateToPostDetail(item)}
              >
                <Feather name="message-circle" size={22} color="#333" />
                <Text className="ml-2 text-lg">{stats.comments}</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                handleSave(item);
              }}
            >
              <Feather 
                name="bookmark" 
                size={22} 
                color={interactions.saved ? "#ffd60a" : "#333"} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Search Bar */}
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
          <Feather name="search" size={20} color="#E91E63" />
          <TextInput
            className="flex-1 ml-2 text-base"
            placeholder="Search"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>
      
      {/* Categories */}
      <View className="px-4 py-4">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              className={`mr-3 px-6 py-4 rounded-lg ${selectedCategory === item.id ? 'bg-[#ffd60a]' : 'bg-[#ffd60a]'}`}
              onPress={() => setSelectedCategory(item.id === selectedCategory ? '' : item.id)}
            >
              <Text className="text-lg font-medium">{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
      
      {/* Sort Options */}
      <View className="px-4 pb-4">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={sortOptions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              className={`mr-3 px-6 py-3 rounded-lg flex-row items-center ${selectedSort === item.id ? 'bg-[#bb0718]' : 'bg-[#bb0718]'}`}
              onPress={() => setSelectedSort(item.id)}
            >
              <Text className="text-lg font-medium text-[#ffd60a] mr-2">{item.name}</Text>
              <Feather name={item.icon as any} size={18} color="#ffd60a" />
            </TouchableOpacity>
          )}
        />
      </View>
      
      {/* Food Posts */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ffd60a" />
        </View>
      ) : (
        <FlatList
          data={foods}
          keyExtractor={(item) => item.id}
          renderItem={renderFoodItem}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}