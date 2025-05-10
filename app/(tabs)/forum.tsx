import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, FlatList, SafeAreaView, ActivityIndicator } from 'react-native';
import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../context/auth-context';
import { getFoods } from '../../services/data/foods';
import { getLikesCount, getSavesCount, getCommentsCount } from '../../services/data/forum';
import { Food } from '../../types/index';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSort, setSelectedSort] = useState('rating');
  const [foodStats, setFoodStats] = useState<{[key: string]: {likes: number, saves: number, comments: number}}>({});
  
  useEffect(() => {
    loadFoods();
  }, [selectedCategory, selectedSort]);
  
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
    router.push({
      pathname: '/post-detail',
      params: { id: food.id }
    });
  };
  
  const renderFoodItem = ({ item }: { item: Food }) => {
    // Get stats for this food
    const stats = foodStats[item.id] || { likes: 0, saves: 0, comments: 0 };
    
    // Mock data for UI elements not in the Food type
    const username = 'Mr. Chef';
    const rating = 4.2;
    
    return (
      <TouchableOpacity 
        className="mb-6 bg-white rounded-lg overflow-hidden"
        onPress={() => navigateToPostDetail(item)}
      >
        <View className="p-4">
          {/* User info and rating */}
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                <Image 
                  source={{ uri: "/placeholder.svg?height=48&width=48&query=user avatar" }}
                  className="w-full h-full"
                />
              </View>
              <Text className="ml-3 text-lg font-bold">{username}</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-lg font-bold mr-1">{rating}</Text>
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
              <TouchableOpacity className="flex-row items-center mr-6">
                <Feather name="message-square" size={22} color="#333" />
                <Text className="ml-2 text-lg">{stats.comments}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity className="flex-row items-center mr-6">
                <Feather name="message-circle" size={22} color="#333" />
                <Text className="ml-2 text-lg">{stats.comments}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity className="flex-row items-center">
                <Feather name="heart" size={22} color="#333" />
                <Text className="ml-2 text-lg">{stats.likes}</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity>
              <Feather name="bookmark" size={22} color="#333" />
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