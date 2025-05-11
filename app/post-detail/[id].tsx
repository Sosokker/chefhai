"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native"
import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons"
import { useLocalSearchParams, router } from "expo-router"
import { useAuth } from "../../context/auth-context"
import { supabase } from "../../services/supabase"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getComments,
  createComment,
  getLikesCount,
  getSavesCount,
  getCommentsCount,
  checkUserLiked,
  checkUserSaved,
} from "../../services/data/forum"
import { getProfile } from "../../services/data/profile"
import { queryKeys, useLikeMutation, useSaveMutation } from "../../hooks/use-foods"

export default function PostDetailScreen() {
  const params = useLocalSearchParams()
  const foodId = typeof params.id === "string" ? params.id : ""
  const queryClient = useQueryClient()
  const scrollViewRef = useRef<ScrollView>(null)

  console.log("Post detail screen - Food ID:", foodId)

  const { isAuthenticated } = useAuth()
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [commentText, setCommentText] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)
  const [showReviews, setShowReviews] = useState(true)
  const [keyboardVisible, setKeyboardVisible] = useState(false)

  // Listen for keyboard events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true)
    })

    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false)
    })

    return () => {
      keyboardDidShowListener.remove()
      keyboardDidHideListener.remove()
    }
  }, [])

  // Recipe info cards data
  const recipeInfoCards = [
    {
      id: "cooking_time",
      title: "Cooking Time",
      icon: (
        <View style={{ backgroundColor: "#ffd60a", padding: 8, borderRadius: 16 }}>
          <Feather name="clock" size={18} color="#bb0718" />
        </View>
      ),
      value: (food: any) => food.time_to_cook_minutes,
      unit: (food: any) => (food.time_to_cook_minutes === 1 ? "minute" : "minutes"),
      gradient: ["#fff8e1", "#fffde7"],
      valueColor: "#bb0718",
    },
    {
      id: "skill_level",
      title: "Skill Level",
      icon: (
        <View style={{ backgroundColor: "#4CAF50", padding: 8, borderRadius: 16 }}>
          <MaterialCommunityIcons name="chef-hat" size={18} color="white" />
        </View>
      ),
      value: (food: any) => food.skill_level,
      unit: () => "",
      gradient: ["#e8f5e9", "#f1f8e9"],
      valueColor: "",
      customContent: (food: any) => (
        <View>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: getSkillLevelColor(food.skill_level) }}>
            {food.skill_level}
          </Text>
          {renderSkillLevelDots(food.skill_level)}
        </View>
      ),
    },
    {
      id: "ingredients",
      title: "Ingredients",
      icon: (
        <View style={{ backgroundColor: "#2196F3", padding: 8, borderRadius: 16 }}>
          <Feather name="list" size={18} color="white" />
        </View>
      ),
      value: (food: any) => food.ingredient_count,
      unit: (food: any) => (food.ingredient_count === 1 ? "item" : "items"),
      gradient: ["#e3f2fd", "#e8f5e9"],
      valueColor: "#2196F3",
    },
    {
      id: "calories",
      title: "Calories",
      icon: (
        <View style={{ backgroundColor: "#F44336", padding: 8, borderRadius: 16 }}>
          <Ionicons name="flame" size={18} color="white" />
        </View>
      ),
      value: (food: any) => food.calories,
      unit: () => "kcal",
      gradient: ["#ffebee", "#fff8e1"],
      valueColor: "#F44336",
    },
  ]

  // Get current user ID from Supabase session
  useEffect(() => {
    async function getCurrentUser() {
      if (isAuthenticated) {
        const { data } = await supabase.auth.getSession()
        const userId = data.session?.user?.id
        console.log("Current user ID:", userId)
        setCurrentUserId(userId || null)
      } else {
        setCurrentUserId(null)
      }
    }

    getCurrentUser()
  }, [isAuthenticated])

  // Fetch food details
  const {
    data: food,
    isLoading: isLoadingFood,
    error: foodError,
  } = useQuery({
    queryKey: queryKeys.foodDetails(foodId),
    queryFn: async () => {
      const { data, error } = await supabase.from("foods").select("*").eq("id", foodId).single()

      if (error) throw error

      return {
        ...data,
        description: data.description || "",
        ingredient_count: data.ingredient_count ?? 0,
        calories: data.calories ?? 0,
        time_to_cook_minutes: data.time_to_cook_minutes ?? 0,
        skill_level: data.skill_level || "Easy",
        image_url: data.image_url || "",
      }
    },
    enabled: !!foodId,
  })

  // Fetch food creator
  const { data: foodCreator, isLoading: isLoadingCreator } = useQuery({
    queryKey: ["food-creator", food?.created_by],
    queryFn: async () => {
      if (!food?.created_by) return null

      const { data, error } = await getProfile(food.created_by)

      if (error) throw error

      return data
    },
    enabled: !!food?.created_by,
  })

  // Fetch food stats
  const {
    data: stats = { likes: 0, saves: 0, comments: 0 },
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["food-stats", foodId],
    queryFn: async () => {
      const [likesRes, savesRes, commentsRes] = await Promise.all([
        getLikesCount(foodId),
        getSavesCount(foodId),
        getCommentsCount(foodId),
      ])

      return {
        likes: likesRes.count || 0,
        saves: savesRes.count || 0,
        comments: commentsRes.count || 0,
      }
    },
    enabled: !!foodId,
  })

  // Fetch user interactions
  const {
    data: interactions = { liked: false, saved: false },
    isLoading: isLoadingInteractions,
    refetch: refetchInteractions,
  } = useQuery({
    queryKey: ["user-interactions", foodId, currentUserId],
    queryFn: async () => {
      if (!currentUserId) return { liked: false, saved: false }

      const [likedRes, savedRes] = await Promise.all([
        checkUserLiked(foodId, currentUserId),
        checkUserSaved(foodId, currentUserId),
      ])

      return {
        liked: !!likedRes.data,
        saved: !!savedRes.data,
      }
    },
    enabled: !!foodId && !!currentUserId,
  })

  // Fetch comments
  const {
    data: comments = [],
    isLoading: isLoadingComments,
    refetch: refetchComments,
  } = useQuery({
    queryKey: queryKeys.foodComments(foodId),
    queryFn: async () => {
      const { data, error } = await getComments(foodId)

      if (error) throw error

      return data || []
    },
    enabled: !!foodId,
  })

  // Set up mutations
  const likeMutation = useLikeMutation()
  const saveMutation = useSaveMutation()

  const commentMutation = useMutation({
    mutationFn: async ({ foodId, userId, content }: { foodId: string; userId: string; content: string }) => {
      return createComment(foodId, userId, content)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.foodComments(foodId) })
      queryClient.invalidateQueries({ queryKey: ["food-stats", foodId] })
      setCommentText("")
      Keyboard.dismiss()
    },
  })

  // Set up real-time subscription for comments
  useEffect(() => {
    if (!foodId) return

    console.log(`Setting up real-time subscription for comments on food_id: ${foodId}`)

    const subscription = supabase
      .channel(`food_comments:${foodId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "food_comments",
          filter: `food_id=eq.${foodId}`,
        },
        () => {
          console.log("Comment change detected, refreshing comments")
          refetchComments()
          refetchStats()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [foodId, refetchComments, refetchStats])

  // Set up real-time subscription for likes and saves
  useEffect(() => {
    if (!foodId) return

    const likesSubscription = supabase
      .channel(`food_likes:${foodId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "food_likes",
          filter: `food_id=eq.${foodId}`,
        },
        () => {
          console.log("Like change detected, refreshing stats and interactions")
          refetchStats()
          refetchInteractions()
        },
      )
      .subscribe()

    const savesSubscription = supabase
      .channel(`food_saves:${foodId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "food_saves",
          filter: `food_id=eq.${foodId}`,
        },
        () => {
          console.log("Save change detected, refreshing stats and interactions")
          refetchStats()
          refetchInteractions()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(likesSubscription)
      supabase.removeChannel(savesSubscription)
    }
  }, [foodId, refetchStats, refetchInteractions])

  const handleLike = async () => {
    if (!isAuthenticated || !currentUserId || !food) {
      Alert.alert("Authentication Required", "Please log in to like posts.")
      return
    }

    try {
      likeMutation.mutate({
        foodId,
        userId: currentUserId,
        isLiked: interactions.liked,
      })
    } catch (error) {
      console.error("Error toggling like:", error)
      Alert.alert("Error", "Failed to update like. Please try again.")
    }
  }

  const handleSave = async () => {
    if (!isAuthenticated || !currentUserId || !food) {
      Alert.alert("Authentication Required", "Please log in to save posts.")
      return
    }

    try {
      saveMutation.mutate({
        foodId,
        userId: currentUserId,
        isSaved: interactions.saved,
      })
    } catch (error) {
      console.error("Error toggling save:", error)
      Alert.alert("Error", "Failed to update save. Please try again.")
    }
  }

  const handleSubmitComment = async () => {
    if (!isAuthenticated || !currentUserId || !foodId || !commentText.trim()) {
      if (!isAuthenticated || !currentUserId) {
        Alert.alert("Authentication Required", "Please log in to comment.")
      }
      return
    }

    setSubmittingComment(true)
    try {
      await commentMutation.mutateAsync({
        foodId,
        userId: currentUserId,
        content: commentText.trim(),
      })
    } catch (error) {
      console.error("Error submitting comment:", error)
      Alert.alert("Error", "Failed to submit comment. Please try again.")
    } finally {
      setSubmittingComment(false)
    }
  }

  // Helper function to get skill level color
  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case "Easy":
        return "#4CAF50" // Green
      case "Medium":
        return "#FFC107" // Amber
      case "Hard":
        return "#F44336" // Red
      default:
        return "#4CAF50" // Default to green
    }
  }

  // Helper function to get skill level dots
  const renderSkillLevelDots = (level: string) => {
    const totalDots = 3
    let activeDots = 1

    if (level === "Medium") activeDots = 2
    if (level === "Hard") activeDots = 3

    return (
      <View style={{ flexDirection: "row", marginTop: 4 }}>
        {[...Array(totalDots)].map((_, i) => (
          <View
            key={i}
            style={{
              height: 8,
              width: 8,
              borderRadius: 4,
              marginRight: 4,
              backgroundColor: getSkillLevelColor(level),
              opacity: i < activeDots ? 1 : 0.3,
            }}
          />
        ))}
      </View>
    )
  }

  // Render recipe info card
  const renderRecipeInfoCard = ({ item }: { item: any }) => {
    if (!food) return null

    return (
      <View
        style={{
          backgroundColor: "#f8f8f8",
          borderRadius: 16,
          padding: 16,
          marginRight: 16,
          width: 160,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
          {item.icon}
          <Text style={{ marginLeft: 8, fontWeight: "bold", color: "#505050" }}>{item.title}</Text>
        </View>
        {item.customContent ? (
          item.customContent(food)
        ) : (
          <View style={{ flexDirection: "row", alignItems: "baseline" }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: item.valueColor }}>{item.value(food)}</Text>
            <Text style={{ marginLeft: 4, fontSize: 14, fontWeight: "500", color: "#606060" }}>{item.unit(food)}</Text>
          </View>
        )}
      </View>
    )
  }

  const isLoading = isLoadingFood || isLoadingCreator || isLoadingStats || isLoadingInteractions || isLoadingComments

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#ffd60a" />
        </View>
      </View>
    )
  }

  if (foodError || !food) {
    return (
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 18 }}>Post not found</Text>
          <TouchableOpacity
            style={{
              marginTop: 16,
              backgroundColor: "#ffd60a",
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
            }}
            onPress={() => router.back()}
          >
            <Text style={{ fontWeight: "bold" }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {/* Fixed Header */}
          <View className="flex-row items-center justify-between px-4 py-3 mt-11">
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

      {/* Scrollable Content */}
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
        <ScrollView ref={scrollViewRef} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
          {/* User info */}
          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 }}>
            <View style={{ width: 48, height: 48, backgroundColor: "#e0e0e0", borderRadius: 24, overflow: "hidden" }}>
              {foodCreator?.avatar_url ? (
                <Image source={{ uri: foodCreator.avatar_url }} style={{ width: "100%", height: "100%" }} />
              ) : (
                <View
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#d0d0d0",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 18, fontWeight: "bold", color: "#606060" }}>
                    {foodCreator?.username?.charAt(0).toUpperCase() || food.created_by?.charAt(0).toUpperCase() || "?"}
                  </Text>
                </View>
              )}
            </View>
            <Text style={{ marginLeft: 12, fontSize: 18, fontWeight: "bold" }}>
              {foodCreator?.username || foodCreator?.full_name || "Chef"}
            </Text>
          </View>

          {/* Food image */}
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <Image
              source={{ uri: food.image_url || "/vibrant-food-dish.png" }}
              style={{ width: "100%", height: 256, borderRadius: 16 }}
              resizeMode="cover"
            />
          </View>

          {/* Food title and description */}
          <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
            <Text style={{ fontSize: 30, fontWeight: "bold", marginBottom: 8 }}>{food.name}</Text>
            <Text style={{ color: "#505050", marginBottom: 8, fontSize: 16, lineHeight: 24 }}>{food.description}</Text>
            <Text style={{ color: "#808080", fontSize: 14 }}>
              {new Date(food.created_at).toLocaleDateString()} -{" "}
              {new Date(food.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </Text>
          </View>

          {/* Recipe Info Cards - Horizontal Scrollable */}
          <View style={{ paddingVertical: 16 }}>
            <Text style={{ paddingHorizontal: 16, fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>
              Recipe Details
            </Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={recipeInfoCards}
              renderItem={renderRecipeInfoCard}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingLeft: 16, paddingRight: 8 }}
            />
          </View>

          {/* Interaction buttons */}
          <View
            style={{
              flexDirection: "row",
              paddingHorizontal: 16,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#e0e0e0",
            }}
          >
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#f0f0f0",
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 24,
              }}
              onPress={handleLike}
            >
              <Feather
                name={interactions.liked ? "heart" : "heart"}
                size={22}
                color={interactions.liked ? "#E91E63" : "#333"}
              />
              <Text style={{ marginLeft: 8, fontSize: 18, fontWeight: "500" }}>{stats.likes}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#f0f0f0",
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 24,
                marginLeft: 16,
              }}
              onPress={handleSave}
            >
              <Feather name="bookmark" size={22} color={interactions.saved ? "#ffd60a" : "#333"} />
              <Text style={{ marginLeft: 8, fontSize: 18, fontWeight: "500" }}>Save</Text>
            </TouchableOpacity>
          </View>

          {/* Reviews section */}
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 16,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#e0e0e0",
            }}
            onPress={() => setShowReviews(!showReviews)}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 20, fontWeight: "bold" }}>Reviews</Text>
              <View
                style={{
                  marginLeft: 8,
                  backgroundColor: "#ffd60a",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: "bold", color: "#bb0718" }}>{stats.comments}</Text>
              </View>
            </View>
            <Feather name={showReviews ? "chevron-up" : "chevron-down"} size={20} color="#333" />
          </TouchableOpacity>

          {showReviews && (
            <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <View key={comment.id} style={{ paddingVertical: 16 }}>
                    <View style={{ flexDirection: "row" }}>
                      {/* Profile picture */}
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          backgroundColor: "#e0e0e0",
                          borderRadius: 20,
                          overflow: "hidden",
                        }}
                      >
                        {comment.user?.avatar_url ? (
                          <Image source={{ uri: comment.user.avatar_url }} style={{ width: "100%", height: "100%" }} />
                        ) : (
                          <View
                            style={{
                              width: "100%",
                              height: "100%",
                              backgroundColor: "#ffd60a",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Text style={{ fontSize: 16, fontWeight: "bold", color: "white" }}>
                              {comment.user?.username?.charAt(0).toUpperCase() ||
                                comment.user_id?.charAt(0).toUpperCase() ||
                                "?"}
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Comment bubble with username inside */}
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <View style={{ backgroundColor: "#f0f0f0", padding: 12, borderRadius: 16 }}>
                          {/* Username inside bubble */}
                          <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 4 }}>
                            {comment.user?.username || comment.user?.full_name || "User"}
                          </Text>

                          {/* Comment content */}
                          <Text style={{ color: "#303030", lineHeight: 20 }}>{comment.content}</Text>
                        </View>

                        {/* Date below bubble */}
                        <Text style={{ color: "#808080", fontSize: 12, marginTop: 4, marginLeft: 8 }}>
                          {new Date(comment.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View style={{ paddingVertical: 32, alignItems: "center" }}>
                  <Feather name="message-circle" size={40} color="#e0e0e0" />
                  <Text style={{ marginTop: 8, color: "#808080", textAlign: "center" }}>No reviews yet.</Text>
                  <Text style={{ color: "#808080", textAlign: "center" }}>Be the first to comment!</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Comment input - Positioned above keyboard */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderTopWidth: 1,
            borderTopColor: "#e0e0e0",
            backgroundColor: "white",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TextInput
              style={{
                flex: 1,
                backgroundColor: "#f0f0f0",
                borderRadius: 24,
                paddingHorizontal: 16,
                paddingVertical: 12,
                marginRight: 8,
              }}
              placeholder="Add a comment..."
              value={commentText}
              onChangeText={setCommentText}
            />
            <TouchableOpacity
              style={{
                padding: 12,
                borderRadius: 24,
                backgroundColor: commentText.trim() && isAuthenticated ? "#ffd60a" : "#e0e0e0",
              }}
              onPress={handleSubmitComment}
              disabled={submittingComment || !commentText.trim() || !isAuthenticated}
            >
              <Feather name="send" size={20} color={commentText.trim() && isAuthenticated ? "#bb0718" : "#666"} />
            </TouchableOpacity>
          </View>
          {!isAuthenticated && (
            <Text style={{ textAlign: "center", fontSize: 14, color: "#E91E63", marginTop: 4 }}>
              Please log in to comment
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}
