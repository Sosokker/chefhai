"use client"

import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native"
import { Feather, FontAwesome } from "@expo/vector-icons"
import { router, useFocusEffect } from "expo-router"
import { useAuth } from "../../context/auth-context"
import { supabase } from "../../services/supabase"
import {
  useFoods,
  useFoodStats,
  useFoodCreators,
  useUserInteractions,
  useLikeMutation,
  useSaveMutation,
} from "../../hooks/use-foods"

// Sort options
const sortOptions = [
  { id: "newest", name: "Newest", icon: "calendar" },
  { id: "like_desc", name: "Most Liked", icon: "heart" },
]

export default function ForumScreen() {
  const { isAuthenticated } = useAuth()
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedSort, setSelectedSort] = useState("newest")

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

  // Use React Query hooks
  const {
    data: foods = [],
    isLoading: isLoadingFoods,
    refetch: refetchFoods,
  } = useFoods(selectedCategory, searchQuery, selectedSort)

  const foodIds = foods.map((food) => food.id)

  const { data: foodStats = {}, isLoading: isLoadingStats } = useFoodStats(foodIds)

  const creatorIds = foods.filter((food) => food.created_by).map((food) => food.created_by as string)

  const { data: foodCreators = {}, isLoading: isLoadingCreators } = useFoodCreators(creatorIds)

  const { data: userInteractions = {}, isLoading: isLoadingInteractions } = useUserInteractions(foodIds, currentUserId)

  const likeMutation = useLikeMutation()
  const saveMutation = useSaveMutation()

  // Refetch data when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refetchFoods()
    }, [refetchFoods]),
  )

  const handleSearch = (text: string) => {
    setSearchQuery(text)
  }

  const navigateToPostDetail = (food: { id: string }) => {
    router.push(`/post-detail/${food.id}`)
  }

  const handleLike = async (food: { id: string }) => {
    if (!isAuthenticated || !currentUserId) {
      Alert.alert("Authentication Required", "Please log in to like posts.")
      return
    }

    try {
      const isLiked = userInteractions[food.id]?.liked || false

      likeMutation.mutate({
        foodId: food.id,
        userId: currentUserId,
        isLiked,
      })
    } catch (error) {
      console.error("Error toggling like:", error)
      Alert.alert("Error", "Failed to update like. Please try again.")
    }
  }

  const handleSave = async (food: { id: string }) => {
    if (!isAuthenticated || !currentUserId) {
      Alert.alert("Authentication Required", "Please log in to save posts.")
      return
    }

    try {
      const isSaved = userInteractions[food.id]?.saved || false

      saveMutation.mutate({
        foodId: food.id,
        userId: currentUserId,
        isSaved,
      })
    } catch (error) {
      console.error("Error toggling save:", error)
      Alert.alert("Error", "Failed to update save. Please try again.")
    }
  }

  const renderFoodItem = ({ item }: { item: any }) => {
    // Get stats for this food
    const stats = foodStats[item.id] || { likes: 0, saves: 0, comments: 0 }

    // Get creator profile
    const creator = item.created_by ? foodCreators[item.created_by] : null

    // Get user interactions
    const interactions = userInteractions[item.id] || { liked: false, saved: false }

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
                  <Image source={{ uri: creator.avatar_url }} className="w-full h-full" />
                ) : (
                  <View className="w-full h-full bg-gray-300 items-center justify-center">
                    <Text className="text-base font-bold text-gray-600">
                      {creator?.username?.charAt(0).toUpperCase() || "?"}
                    </Text>
                  </View>
                )}
              </View>
              <Text className="ml-3 text-lg font-bold">
                {creator?.username || creator?.full_name || "Unknown Chef"}
              </Text>
            </View>
          </View>

          {/* Food image */}
          <View className="rounded-lg overflow-hidden mb-4">
            <Image
              source={{ uri: item.image_url }}
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
                  e.stopPropagation()
                  handleLike(item)
                }}
              >
                <Feather name="heart" size={22} color={interactions.liked ? "#E91E63" : "#333"} />
                <Text className="ml-2 text-lg">{stats.likes}</Text>
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center mr-6" onPress={() => navigateToPostDetail(item)}>
                <Feather name="message-circle" size={22} color="#333" />
                <Text className="ml-2 text-lg">{stats.comments}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation()
                handleSave(item)
              }}
            >
              <Feather name="bookmark" size={22} color={interactions.saved ? "#ffd60a" : "#333"} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  const isLoading = isLoadingFoods || isLoadingStats || isLoadingCreators || isLoadingInteractions

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


      {/* Sort Options */}
      <View className="px-4 pb-4">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={sortOptions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              className={`mr-3 px-6 py-3 rounded-lg flex-row items-center ${selectedSort === item.id ? "bg-[#bb0718]" : "bg-gray-200"}`}
              onPress={() => setSelectedSort(item.id)}
            >
              <Text
                className={`text-lg font-medium ${selectedSort === item.id ? "text-[#ffd60a]" : "text-gray-800"} mr-2`}
              >
                {item.name}
              </Text>
              <Feather name={item.icon as any} size={18} color={selectedSort === item.id ? "#ffd60a" : "#333"} />
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Food Posts */}
      {isLoading ? (
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
  )
}
