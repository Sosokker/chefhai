import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '../../context/auth-context';
import { getFoods, getIngredients, getNutrients } from '../../services/data/foods';
import { 
  createLike, 
  deleteLike, 
  createSave, 
  deleteSave, 
  getComments, 
  createComment,
  getLikesCount,
  getSavesCount,
  getCommentsCount,
  checkUserLiked,
  checkUserSaved
} from '../../services/data/forum';
import { getProfile } from '../../services/data/profile';
import { Food, Ingredient, Nutrient, FoodComment, Profile } from '../../types/index';
import { supabase } from '../../services/supabase';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const foodId = typeof id === 'string' ? id : '';
                 
  console.log('Post detail screen - Food ID:', foodId);
  
  const { isAuthenticated } = useAuth();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [food, setFood] = useState<Food | null>(null);
  const [foodCreator, setFoodCreator] = useState<Profile | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [nutrients, setNutrients] = useState<Nutrient | null>(null);
  const [comments, setComments] = useState<FoodComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showReviews, setShowReviews] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [stats, setStats] = useState({
    likes: 0,
    saves: 0,
    comments: 0
  });
  
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
  
  useEffect(() => {
    if (foodId) {
      console.log('Loading food details for ID:', foodId);
      loadFoodDetails();
    } else {
      console.error('No food ID provided');
    }
  }, [foodId]);
  
  // Set up real-time subscription for comments
  useEffect(() => {
    if (!foodId) return;
    
    console.log(`Setting up real-time subscription for comments on food_id: ${foodId}`);
    
    const subscription = supabase
      .channel(`food_comments:${foodId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'food_comments',
        filter: `food_id=eq.${foodId}`
      }, (payload) => {
        console.log('Comment change detected:', payload);
        // Refresh comments when changes occur
        refreshComments();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [foodId]);
  
  // Check if user has liked/saved when user ID changes
  useEffect(() => {
    if (foodId && currentUserId && food) {
      checkUserInteractions();
    }
  }, [currentUserId, foodId, food]);
  
  const checkUserInteractions = async () => {
    if (!currentUserId || !foodId) return;
    
    try {
      console.log('Checking user interactions with user ID:', currentUserId);
      
      const [likedRes, savedRes] = await Promise.all([
        checkUserLiked(foodId, currentUserId),
        checkUserSaved(foodId, currentUserId)
      ]);
      
      console.log('User liked:', !!likedRes.data);
      console.log('User saved:', !!savedRes.data);
      
      setIsLiked(!!likedRes.data);
      setIsSaved(!!savedRes.data);
    } catch (error) {
      console.error('Error checking user interactions:', error);
    }
  };
  
  const refreshComments = async () => {
    if (!foodId) {
      console.error('Cannot refresh comments: No food ID');
      return;
    }
    
    try {
      console.log(`Refreshing comments for food_id: ${foodId}`);
      
      const { data: commentsData, error } = await getComments(foodId);
      
      if (error) {
        console.error('Error refreshing comments:', error);
        return;
      }
      
      if (commentsData) {
        console.log(`Refreshed ${commentsData.length} comments for food_id: ${foodId}`);
        setComments(commentsData);
      }
      
      const { count } = await getCommentsCount(foodId);
      setStats(prev => ({ ...prev, comments: count || 0 }));
    } catch (error) {
      console.error('Error refreshing comments:', error);
    }
  };
  
  const loadFoodDetails = async () => {
    if (!foodId) {
      console.error('Cannot load food details: No food ID');
      return;
    }
    
    setLoading(true);
    try {
      console.log('Loading food details for ID:', foodId);
      
      // Get specific food by ID
      const { data: foodData, error: foodError } = await supabase
        .from('foods')
        .select('*')
        .eq('id', foodId)
        .single();
      
      if (foodError) {
        console.error('Error loading food:', foodError);
        return;
      }
      
      if (foodData) {
        const foodItem = {
          ...foodData,
          description: foodData.description || '', 
          ingredient_count: foodData.ingredient_count ?? 0,
          calories: foodData.calories ?? 0,
          image_url: foodData.image_url || '',
        };
        
        console.log('Food loaded:', foodItem.name);
        setFood(foodItem);
        
        // Get food creator profile
        if (foodItem.created_by) {
          console.log('Loading creator profile for:', foodItem.created_by);
          const { data: creatorProfile } = await getProfile(foodItem.created_by);
          if (creatorProfile) {
            setFoodCreator(creatorProfile);
          }
        }
        
        // Get ingredients
        const { data: ingredientsData, error: ingredientsError } = await getIngredients(foodId);
        
        if (!ingredientsError && ingredientsData) {
          setIngredients(ingredientsData);
        }
        
        // Get nutrients
        const { data: nutrientsData, error: nutrientsError } = await getNutrients(foodId);
        
        if (!nutrientsError && nutrientsData) {
          setNutrients(nutrientsData);
        }
        
        // Get comments for this specific food ID
        const { data: commentsData, error: commentsError } = await getComments(foodId);
        
        if (commentsError) {
          console.error('Error loading comments:', commentsError);
        } else if (commentsData) {
          console.log(`Loaded ${commentsData.length} comments for food_id: ${foodId}`);
          setComments(commentsData);
        }
        
        // Get stats
        const [likesRes, savesRes, commentsRes] = await Promise.all([
          getLikesCount(foodId),
          getSavesCount(foodId),
          getCommentsCount(foodId)
        ]);
        
        console.log('Stats loaded:', { 
          likes: likesRes.count || 0, 
          saves: savesRes.count || 0, 
          comments: commentsRes.count || 0 
        });
        
        setStats({
          likes: likesRes.count || 0,
          saves: savesRes.count || 0,
          comments: commentsRes.count || 0
        });
      }
    } catch (error) {
      console.error('Error loading food details:', error);
      Alert.alert('Error', 'Failed to load food details. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLike = async () => {
    if (!isAuthenticated || !currentUserId || !food) {
      Alert.alert('Authentication Required', 'Please log in to like posts.');
      return;
    }
    
    try {
      console.log('Toggling like with user ID:', currentUserId, 'and food ID:', foodId);
      
      // Optimistically update UI
      setIsLiked(!isLiked);
      setStats(prev => ({ 
        ...prev, 
        likes: isLiked ? Math.max(0, prev.likes - 1) : prev.likes + 1 
      }));
      
      if (isLiked) {
        const { error } = await deleteLike(foodId, currentUserId);
        if (error) {
          console.error('Error deleting like:', error);
          // Revert optimistic update if there's an error
          setIsLiked(true);
          setStats(prev => ({ ...prev, likes: prev.likes + 1 }));
          Alert.alert('Error', 'Failed to unlike. Please try again.');
        }
      } else {
        const { error } = await createLike(foodId, currentUserId);
        if (error) {
          console.error('Error creating like:', error);
          // Revert optimistic update if there's an error
          setIsLiked(false);
          setStats(prev => ({ ...prev, likes: Math.max(0, prev.likes - 1) }));
          Alert.alert('Error', 'Failed to like. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update if there's an error
      setIsLiked(!isLiked);
      setStats(prev => ({ 
        ...prev, 
        likes: !isLiked ? Math.max(0, prev.likes - 1) : prev.likes + 1 
      }));
      Alert.alert('Error', 'Failed to update like. Please try again.');
    }
  };
  
  const handleSave = async () => {
    if (!isAuthenticated || !currentUserId || !food) {
      Alert.alert('Authentication Required', 'Please log in to save posts.');
      return;
    }
    
    try {
      console.log('Toggling save with user ID:', currentUserId, 'and food ID:', foodId);
      
      // Optimistically update UI
      setIsSaved(!isSaved);
      setStats(prev => ({ 
        ...prev, 
        saves: isSaved ? Math.max(0, prev.saves - 1) : prev.saves + 1 
      }));
      
      if (isSaved) {
        const { error } = await deleteSave(foodId, currentUserId);
        if (error) {
          console.error('Error deleting save:', error);
          // Revert optimistic update if there's an error
          setIsSaved(true);
          setStats(prev => ({ ...prev, saves: prev.saves + 1 }));
          Alert.alert('Error', 'Failed to unsave. Please try again.');
        }
      } else {
        const { error } = await createSave(foodId, currentUserId);
        if (error) {
          console.error('Error creating save:', error);
          // Revert optimistic update if there's an error
          setIsSaved(false);
          setStats(prev => ({ ...prev, saves: Math.max(0, prev.saves - 1) }));
          Alert.alert('Error', 'Failed to save. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      // Revert optimistic update if there's an error
      setIsSaved(!isSaved);
      setStats(prev => ({ 
        ...prev, 
        saves: !isSaved ? Math.max(0, prev.saves - 1) : prev.saves + 1 
      }));
      Alert.alert('Error', 'Failed to update save. Please try again.');
    }
  };
  
  const handleSubmitComment = async () => {
    if (!isAuthenticated || !currentUserId || !foodId || !commentText.trim()) {
      if (!isAuthenticated || !currentUserId) {
        Alert.alert('Authentication Required', 'Please log in to comment.');
      }
      return;
    }
    
    setSubmittingComment(true);
    try {
      console.log('Submitting comment with user ID:', currentUserId, 'and food ID:', foodId);
      
      const { error } = await createComment(foodId, currentUserId, commentText.trim());
      
      if (error) {
        console.error('Error creating comment:', error);
        Alert.alert('Error', 'Failed to submit comment. Please try again.');
        return;
      }
      
      // Clear comment text
      setCommentText('');
      
      // Refresh comments
      await refreshComments();
      
      console.log('Comment submitted successfully');
    } catch (error) {
      console.error('Error submitting comment:', error);
      Alert.alert('Error', 'Failed to submit comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };
  
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ffd60a" />
        </View>
      </SafeAreaView>
    );
  }
  
  if (!food) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg">Post not found</Text>
          <TouchableOpacity 
            className="mt-4 bg-[#ffd60a] px-6 py-3 rounded-lg"
            onPress={() => router.back()}
          >
            <Text className="font-bold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView className="flex-1">
          {/* Header */}
          <View className="flex-row justify-between items-center px-4 py-3">
            <TouchableOpacity 
              className="bg-[#ffd60a] p-3 rounded-lg"
              onPress={() => router.back()}
            >
              <Feather name="arrow-left" size={24} color="#bb0718" />
            </TouchableOpacity>
            
            <Text className="text-2xl font-bold">Post</Text>
            
            <TouchableOpacity>
              <Feather name="more-horizontal" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          {/* User info and rating */}
          <View className="flex-row justify-between items-center px-4 py-3">
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                {foodCreator?.avatar_url ? (
                  <Image 
                    source={{ uri: foodCreator.avatar_url }}
                    className="w-full h-full"
                  />
                ) : (
                  <View className="w-full h-full bg-gray-300 items-center justify-center">
                    <Text className="text-lg font-bold text-gray-600">
                      {foodCreator?.username?.charAt(0).toUpperCase() || '?'}
                    </Text>
                  </View>
                )}
              </View>
              <Text className="ml-3 text-lg font-bold">
                {foodCreator?.username || foodCreator?.full_name || 'Unknown Chef'}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-lg font-bold mr-1">4.2</Text>
              <FontAwesome name="star" size={20} color="#ffd60a" />
            </View>
          </View>
          
          {/* Food image */}
          <View className="px-4 mb-4">
            <Image 
              source={{ uri: food.image_url || "/placeholder.svg?height=300&width=500&query=food dish" }}
              className="w-full h-64 rounded-lg"
              resizeMode="cover"
            />
          </View>
          
          {/* Food title and description */}
          <View className="px-4 mb-2">
            <Text className="text-2xl font-bold mb-2">{food.name}</Text>
            <Text className="text-gray-700 mb-2">{food.description}</Text>
            <Text className="text-gray-500 text-sm">
              {new Date(food.created_at).toLocaleDateString()} - {new Date(food.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          
          {/* Interaction buttons */}
          <View className="flex-row justify-between px-4 py-4 border-b border-gray-200">
            <TouchableOpacity className="flex-row items-center">
              <Feather name="message-square" size={22} color="#333" />
              <Text className="ml-2 text-lg">{stats.comments}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="flex-row items-center">
              <Feather name="message-circle" size={22} color="#333" />
              <Text className="ml-2 text-lg">{stats.comments}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-row items-center"
              onPress={handleLike}
            >
              <Feather name="heart" size={22} color={isLiked ? "#E91E63" : "#333"} />
              <Text className="ml-2 text-lg">{stats.likes}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleSave}>
              <Feather name="bookmark" size={22} color={isSaved ? "#ffd60a" : "#333"} />
            </TouchableOpacity>
          </View>
          
          {/* Reviews section */}
          <TouchableOpacity 
            className="flex-row items-center px-4 py-4 border-b border-gray-200"
            onPress={() => setShowReviews(!showReviews)}
          >
            <Text className="text-xl font-bold">Review</Text>
            <Feather name={showReviews ? "chevron-up" : "chevron-down"} size={20} color="#333" className="ml-2" />
          </TouchableOpacity>
          
          {showReviews && (
            <View className="px-4 py-2">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <View key={comment.id} className="py-4 border-b border-gray-100">
                    <View className="flex-row items-center mb-2">
                      <View className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden mr-3">
                        {comment.user?.avatar_url ? (
                          <Image 
                            source={{ uri: comment.user.avatar_url }}
                            className="w-full h-full"
                          />
                        ) : (
                          <View className="w-full h-full bg-gray-300 items-center justify-center">
                            <Text className="text-base font-bold text-gray-600">
                              {comment.user?.username?.charAt(0).toUpperCase() || '?'}
                            </Text>
                          </View>
                        )}
                      </View>
                      <View className="flex-row items-center justify-between flex-1">
                        <Text className="font-bold">
                          {comment.user?.username || comment.user?.full_name || 'Unknown User'}
                        </Text>
                        <Text className="text-gray-500 text-xs">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <Text>{comment.content}</Text>
                  </View>
                ))
              ) : (
                <Text className="py-4 text-gray-500">No reviews yet. Be the first to comment!</Text>
              )}
            </View>
          )}
          
          {/* Bottom spacing */}
          <View className="h-24" />
        </ScrollView>
        
        {/* Comment input */}
        <View className="px-4 py-3 border-t border-gray-200 bg-white">
          <View className="flex-row items-center">
            <TextInput
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 mr-2"
              placeholder="Add a comment..."
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <TouchableOpacity 
              className={`p-2 rounded-full ${commentText.trim() && isAuthenticated ? 'bg-[#ffd60a]' : 'bg-gray-300'}`}
              onPress={handleSubmitComment}
              disabled={submittingComment || !commentText.trim() || !isAuthenticated}
            >
              <Feather name="send" size={20} color={commentText.trim() && isAuthenticated ? "#bb0718" : "#666"} />
            </TouchableOpacity>
          </View>
          {!isAuthenticated && (
            <Text className="text-center text-sm text-red-500 mt-1">
              Please log in to comment
            </Text>
          )}
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}