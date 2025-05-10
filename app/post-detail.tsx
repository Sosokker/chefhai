import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '../context/auth-context';
import { getFoods, getIngredients, getNutrients } from '../services/data/foods';
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
} from '../services/data/forum';
import { Food, Ingredient, Nutrient, FoodComment } from '../types/index';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const authContext = useAuth();
  const { isAuthenticated } = authContext || {}; // Adjust based on the actual structure of AuthContextType
  const [food, setFood] = useState<Food | null>(null);
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
  
  // Mock data for UI elements
  const username = 'Mr. Chef';
  const rating = 4.2;
  
  useEffect(() => {
    if (id) {
      loadFoodDetails();
    }
  }, [id]);
  
  const loadFoodDetails = async () => {
    setLoading(true);
    try {
      // Get food details
      const { data: foodData, error: foodError } = await getFoods(undefined, undefined, undefined, 1, 0);
      
      if (foodError) {
        console.error('Error loading food:', foodError);
        return;
      }
      
      if (foodData && foodData.length > 0) {
        setFood({
                          ...foodData[0],
                          description: foodData[0].description || '', // Ensure description is always a string
                          ingredient_count: foodData[0].ingredient_count ?? 0, // Provide default value for ingredient_count
                          calories: foodData[0].calories ?? 0, // Provide default value for calories
                          image_url: foodData[0].image_url || '', // Provide default value for image_url
                        });
        
        // Get ingredients
        const { data: ingredientsData, error: ingredientsError } = await getIngredients(foodData[0].id);
        
        if (!ingredientsError && ingredientsData) {
          setIngredients(ingredientsData);
        }
        
        // Get nutrients
        const { data: nutrientsData, error: nutrientsError } = await getNutrients(foodData[0].id);
        
        if (!nutrientsError && nutrientsData) {
          setNutrients(nutrientsData);
        }
        
        // Get comments
        const { data: commentsData, error: commentsError } = await getComments(foodData[0].id);
        
        if (!commentsError && commentsData) {
          setComments(commentsData);
        }
        
        // Get stats
        const [likesRes, savesRes, commentsRes] = await Promise.all([
          getLikesCount(foodData[0].id),
          getSavesCount(foodData[0].id),
          getCommentsCount(foodData[0].id)
        ]);
        
        setStats({
          likes: likesRes.count || 0,
          saves: savesRes.count || 0,
          comments: commentsRes.count || 0
        });
        
        // Check if user has liked/saved
        if (isAuthenticated) {
          const userId = 'current-user-id'; // Replace with actual user ID
          
          const [likedRes, savedRes] = await Promise.all([
            checkUserLiked(foodData[0].id, userId),
            checkUserSaved(foodData[0].id, userId)
          ]);
          
          setIsLiked(!!likedRes.data);
          setIsSaved(!!savedRes.data);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLike = async () => {
    if (!authContext.isAuthenticated || !food) return;
    
    try {
      const userId = 'current-user-id'; // Replace with actual user ID
      
      if (isLiked) {
        await deleteLike(food.id, userId);
        setIsLiked(false);
        setStats(prev => ({ ...prev, likes: Math.max(0, prev.likes - 1) }));
      } else {
        await createLike(food.id, userId);
        setIsLiked(true);
        setStats(prev => ({ ...prev, likes: prev.likes + 1 }));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };
  
  const handleSave = async () => {
    if (!authContext.isAuthenticated || !food) return;
    
    try {
      const userId = 'current-user-id'; // Replace with actual user ID
      
      if (isSaved) {
        await deleteSave(food.id, userId);
        setIsSaved(false);
        setStats(prev => ({ ...prev, saves: Math.max(0, prev.saves - 1) }));
      } else {
        await createSave(food.id, userId);
        setIsSaved(true);
        setStats(prev => ({ ...prev, saves: prev.saves + 1 }));
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };
  
  const handleSubmitComment = async () => {
    if (!authContext.isAuthenticated || !food || !commentText.trim()) return;
    
    setSubmittingComment(true);
    try {
      const userId = 'current-user-id'; // Replace with actual user ID
      
      await createComment(food.id, userId, commentText.trim());
      
      // Refresh comments
      const { data: commentsData } = await getComments(food.id);
      
      if (commentsData) {
        setComments(commentsData);
        setStats(prev => ({ ...prev, comments: prev.comments + 1 }));
      }
      
      setCommentText('');
    } catch (error) {
      console.error('Error submitting comment:', error);
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
            <Text className="text-gray-500 text-sm">09:41 - 4/3/25</Text>
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
              <Feather name={isLiked ? "heart" : "heart"} size={22} color={isLiked ? "#E91E63" : "#333"} />
              <Text className="ml-2 text-lg">{stats.likes}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleSave}>
              <Feather name={isSaved ? "bookmark" : "bookmark"} size={22} color={isSaved ? "#ffd60a" : "#333"} />
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
                        <Image 
                          source={{ uri: "/placeholder.svg?height=40&width=40&query=user avatar" }}
                          className="w-full h-full"
                        />
                      </View>
                      <View className="flex-row items-center justify-between flex-1">
                        <Text className="font-bold">{comment.user_id}</Text>
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
              className="bg-[#ffd60a] p-2 rounded-full"
              onPress={handleSubmitComment}
              disabled={submittingComment || !commentText.trim()}
            >
              <Feather name="send" size={20} color="#bb0718" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}