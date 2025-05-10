import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '../../context/auth-context';
import { supabase } from '../../services/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { queryKeys, useLikeMutation, useSaveMutation } from '../../hooks/use-foods';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const foodId = typeof id === 'string' ? id : '';
  const queryClient = useQueryClient();
                 
  console.log('Post detail screen - Food ID:', foodId);
  
  const { isAuthenticated } = useAuth();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showReviews, setShowReviews] = useState(true);
  
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
  
  // Fetch food details
  const { 
    data: food,
    isLoading: isLoadingFood,
    error: foodError
  } = useQuery({
    queryKey: queryKeys.foodDetails(foodId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .eq('id', foodId)
        .single();
        
      if (error) throw error;
      
      return {
        ...data,
        description: data.description || '',
        ingredient_count: data.ingredient_count ?? 0,
        calories: data.calories ?? 0,
        image_url: data.image_url || '',
      };
    },
    enabled: !!foodId,
  });
  
  // Fetch food creator
  const { 
    data: foodCreator,
    isLoading: isLoadingCreator
  } = useQuery({
    queryKey: ['food-creator', food?.created_by],
    queryFn: async () => {
      if (!food?.created_by) return null;
      
      const { data, error } = await getProfile(food.created_by);
      
      if (error) throw error;
      
      return data;
    },
    enabled: !!food?.created_by,
  });
  
  // Fetch food stats
  const { 
    data: stats = { likes: 0, saves: 0, comments: 0 },
    isLoading: isLoadingStats,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['food-stats', foodId],
    queryFn: async () => {
      const [likesRes, savesRes, commentsRes] = await Promise.all([
        getLikesCount(foodId),
        getSavesCount(foodId),
        getCommentsCount(foodId)
      ]);
      
      return {
        likes: likesRes.count || 0,
        saves: savesRes.count || 0,
        comments: commentsRes.count || 0
      };
    },
    enabled: !!foodId,
  });
  
  // Fetch user interactions
  const { 
    data: interactions = { liked: false, saved: false },
    isLoading: isLoadingInteractions,
    refetch: refetchInteractions
  } = useQuery({
    queryKey: ['user-interactions', foodId, currentUserId],
    queryFn: async () => {
      if (!currentUserId) return { liked: false, saved: false };
      
      const [likedRes, savedRes] = await Promise.all([
        checkUserLiked(foodId, currentUserId),
        checkUserSaved(foodId, currentUserId)
      ]);
      
      return {
        liked: !!likedRes.data,
        saved: !!savedRes.data
      };
    },
    enabled: !!foodId && !!currentUserId,
  });
  
  // Fetch comments
  const { 
    data: comments = [],
    isLoading: isLoadingComments,
    refetch: refetchComments
  } = useQuery({
    queryKey: queryKeys.foodComments(foodId),
    queryFn: async () => {
      const { data, error } = await getComments(foodId);
      
      if (error) throw error;
      
      return data || [];
    },
    enabled: !!foodId,
  });
  
  // Set up mutations
  const likeMutation = useLikeMutation();
  const saveMutation = useSaveMutation();
  
  const commentMutation = useMutation({
    mutationFn: async ({ foodId, userId, content }: { foodId: string, userId: string, content: string }) => {
      return createComment(foodId, userId, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.foodComments(foodId) });
      queryClient.invalidateQueries({ queryKey: ['food-stats', foodId] });
      setCommentText('');
    },
  });
  
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
      }, () => {
        console.log('Comment change detected, refreshing comments');
        refetchComments();
        refetchStats();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [foodId, refetchComments, refetchStats]);
  
  // Set up real-time subscription for likes and saves
  useEffect(() => {
    if (!foodId) return;
    
    const likesSubscription = supabase
      .channel(`food_likes:${foodId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'food_likes',
        filter: `food_id=eq.${foodId}`
      }, () => {
        console.log('Like change detected, refreshing stats and interactions');
        refetchStats();
        refetchInteractions();
      })
      .subscribe();
      
    const savesSubscription = supabase
      .channel(`food_saves:${foodId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'food_saves',
        filter: `food_id=eq.${foodId}`
      }, () => {
        console.log('Save change detected, refreshing stats and interactions');
        refetchStats();
        refetchInteractions();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(likesSubscription);
      supabase.removeChannel(savesSubscription);
    };
  }, [foodId, refetchStats, refetchInteractions]);
  
  const handleLike = async () => {
    if (!isAuthenticated || !currentUserId || !food) {
      Alert.alert('Authentication Required', 'Please log in to like posts.');
      return;
    }
    
    try {
      likeMutation.mutate({
        foodId,
        userId: currentUserId,
        isLiked: interactions.liked
      });
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Error', 'Failed to update like. Please try again.');
    }
  };
  
  const handleSave = async () => {
    if (!isAuthenticated || !currentUserId || !food) {
      Alert.alert('Authentication Required', 'Please log in to save posts.');
      return;
    }
    
    try {
      saveMutation.mutate({
        foodId,
        userId: currentUserId,
        isSaved: interactions.saved
      });
    } catch (error) {
      console.error('Error toggling save:', error);
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
      await commentMutation.mutateAsync({
        foodId,
        userId: currentUserId,
        content: commentText.trim()
      });
    } catch (error) {
      console.error('Error submitting comment:', error);
      Alert.alert('Error', 'Failed to submit comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };
  
  const isLoading = isLoadingFood || isLoadingCreator || isLoadingStats || isLoadingInteractions || isLoadingComments;
  
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ffd60a" />
        </View>
      </SafeAreaView>
    );
  }
  
  if (foodError || !food) {
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
                      {foodCreator?.username?.charAt(0).toUpperCase() || food.created_by?.charAt(0).toUpperCase() || '?'}
                    </Text>
                  </View>
                )}
              </View>
              <Text className="ml-3 text-lg font-bold">
                {foodCreator?.username || foodCreator?.full_name || 'Chef'}
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

            <TouchableOpacity 
              className="flex-row items-center"
              onPress={handleLike}
              >
              <Feather name="heart" size={22} color={interactions.liked ? "#E91E63" : "#333"} />
              <Text className="ml-2 text-lg">{stats.likes}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="flex-row items-center">
              <Feather name="message-circle" size={22} color="#333" />
              <Text className="ml-2 text-lg">{stats.comments}</Text>
            </TouchableOpacity>
            
            
            <TouchableOpacity onPress={handleSave}>
              <Feather name="bookmark" size={22} color={interactions.saved ? "#ffd60a" : "#333"} />
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
                              {comment.user?.username?.charAt(0).toUpperCase() || comment.user_id?.charAt(0).toUpperCase() || '?'}
                            </Text>
                          </View>
                        )}
                      </View>
                      <View className="flex-row items-center justify-between flex-1">
                        <Text className="font-bold">
                          {comment.user?.username || comment.user?.full_name || 'User'}
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