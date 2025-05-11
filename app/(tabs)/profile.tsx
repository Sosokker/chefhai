"use client"

import { useAuth } from "@/context/auth-context"
import { getFoods } from "@/services/data/foods"
import { getBookmarkedPosts } from "@/services/data/bookmarks"
import { getLikedPosts } from "@/services/data/likes"
import { getProfile, updateProfile } from "@/services/data/profile"
import { supabase } from "@/services/supabase"
import { useIsFocused } from "@react-navigation/native"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import * as ImagePicker from "expo-image-picker"
import { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import uuid from "react-native-uuid"
import { router } from "expo-router"

// Define the Food type based on your database structure
type Food = {
  id: number
  name: string
  description: string
  time_to_cook_minutes: number
  skill_level: string
  ingredient_count: number
  calories: number
  image_url: string
  is_shared: boolean
  created_by: string
  created_at: string
}

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState("My Recipes")
  const { isAuthenticated } = useAuth()
  const isFocused = useIsFocused()
  const queryClient = useQueryClient()

  const {
    data: userData,
    isLoading: isUserLoading,
    error: userError,
  } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error) throw error
      return data?.user
    },
    enabled: isAuthenticated,
    staleTime: 0,
  })
  const userId = userData?.id

  const {
    data: profileData,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) throw new Error("No user id")
      return getProfile(userId)
    },
    enabled: !!userId,
    staleTime: 0,
    subscribed: isFocused,
  })

  // My Recipes Query
  const {
    data: myRecipesData,
    isLoading: isMyRecipesLoading,
    error: myRecipesError,
    refetch: refetchMyRecipes,
  } = useQuery({
    queryKey: ["my-recipes", userId],
    queryFn: async () => {
      if (!userId) throw new Error("No user id")
      return getFoods(userId)
    },
    enabled: !!userId,
    staleTime: 1000 * 60, // 1 minute
  })

  // Likes Query
  const {
    data: likesData,
    isLoading: isLikesLoading,
    error: likesError,
    refetch: refetchLikes,
  } = useQuery({
    queryKey: ["liked-posts", userId],
    queryFn: async () => {
      if (!userId) throw new Error("No user id")
      return getLikedPosts(userId)
    },
    enabled: !!userId,
    staleTime: 1000 * 60, // 1 minute
  })

  // Bookmarks Query
  const {
    data: bookmarksData,
    isLoading: isBookmarksLoading,
    error: bookmarksError,
    refetch: refetchBookmarks,
  } = useQuery({
    queryKey: ["bookmarked-posts", userId],
    queryFn: async () => {
      if (!userId) throw new Error("No user id")
      return getBookmarkedPosts(userId)
    },
    enabled: !!userId,
    staleTime: 1000 * 60, // 1 minute
  })

  // Navigate to post detail using Expo Router instead of navigation API
  const handleFoodPress = (foodId: number) => {
    router.push(`/post-detail/${foodId}`)
  }

  // Refetch data when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)

    // Refetch data for the selected tab
    if (tab === "My Recipes") {
      refetchMyRecipes()
    } else if (tab === "Likes") {
      refetchLikes()
    } else if (tab === "Bookmarks") {
      refetchBookmarks()
    }
  }

  // Refetch all data when the screen comes into focus
  useEffect(() => {
    if (isFocused && userId) {
      refetchMyRecipes()
      refetchLikes()
      refetchBookmarks()
    }
  }, [isFocused, userId])

  const [modalVisible, setModalVisible] = useState(false)
  const [editUsername, setEditUsername] = useState("")
  const [editImage, setEditImage] = useState<string | null>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      setEditError("Permission to access media library is required.")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      allowsEditing: true,
    })

    if (!result.canceled) {
      setEditImage(result.assets[0].uri)
    }
  }

  const uploadImageToSupabase = async (uri: string): Promise<string> => {
    const fileName = `${userId}/${uuid.v4()}.jpg`
    const response = await fetch(uri)
    const blob = await response.blob()

    const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, blob, {
      contentType: "image/jpeg",
      upsert: true,
    })

    if (uploadError) throw uploadError

    const { data } = supabase.storage.from("avatars").getPublicUrl(fileName)
    return data.publicUrl
  }

  const handleSaveProfile = async () => {
    setEditLoading(true)
    setEditError(null)

    try {
      if (!editUsername.trim()) throw new Error("Username cannot be empty")

      let avatarUrl = profileData?.data?.avatar_url ?? null

      if (editImage && editImage !== avatarUrl) {
        avatarUrl = await uploadImageToSupabase(editImage)
      }

      const { error: updateError } = await updateProfile(userId!, editUsername.trim(), avatarUrl)
      if (updateError) throw updateError

      setModalVisible(false)
      await queryClient.invalidateQueries({ queryKey: ["profile", userId] })
    } catch (err: any) {
      setEditError(err.message || "Failed to update profile")
    } finally {
      setEditLoading(false)
    }
  }

  // Get the active data based on the current tab
  const getActiveData = () => {
    switch (activeTab) {
      case "My Recipes":
        return { data: myRecipesData, isLoading: isMyRecipesLoading, error: myRecipesError }
      case "Likes":
        return { data: likesData, isLoading: isLikesLoading, error: likesError }
      case "Bookmarks":
        return { data: bookmarksData, isLoading: isBookmarksLoading, error: bookmarksError }
      default:
        return { data: myRecipesData, isLoading: isMyRecipesLoading, error: myRecipesError }
    }
  }

  const { data: activeData, isLoading: isActiveLoading, error: activeError } = getActiveData()

  if (isUserLoading) {
    return (
      <SafeAreaView className="items-center justify-center flex-1 bg-white">
        <ActivityIndicator size="large" color="#bb0718" />
      </SafeAreaView>
    )
  }

  if (userError) {
    return (
      <SafeAreaView className="items-center justify-center flex-1 px-4 bg-white">
        <Text className="font-bold text-center text-red-600">{userError.message || "Failed to load user data."}</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView className="flex-1">
        <View className="items-center py-6">
          <View className="w-[100px] h-[100px] rounded-full border border-gray-300 justify-center items-center mb-3 overflow-hidden">
            <Image
              source={
                profileData?.data?.avatar_url
                  ? { uri: profileData.data.avatar_url }
                  : require("@/assets/images/placeholder-food.jpg")
              }
              className="w-[96px] h-[96px] rounded-full"
            />
          </View>
          {isLoading ? (
            <ActivityIndicator size="small" color="#bb0718" />
          ) : error ? (
            <Text className="mb-3 font-bold text-red-600">{error.message || error.toString()}</Text>
          ) : (
            <Text className="mb-3 text-xl font-bold">{profileData?.data?.username ?? "-"}</Text>
          )}
          <TouchableOpacity
            className="px-10 py-2 bg-red-600 rounded-lg"
            onPress={() => {
              setEditUsername(profileData?.data?.username ?? "")
              setEditImage(profileData?.data?.avatar_url ?? null)
              setEditError(null)
              setModalVisible(true)
            }}
          >
            <Text className="font-bold text-white">Edit</Text>
          </TouchableOpacity>

          {/* Edit Modal */}
          <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
            <View className="items-center justify-center flex-1 bg-gray-50 bg-opacity-40">
              <View className="w-11/12 max-w-md p-6 bg-white shadow-md rounded-xl">
                <Text className="mb-4 text-lg font-bold text-center">Edit Profile</Text>

                <Pressable className="items-center mb-4" onPress={pickImage}>
                  <Image
                    source={editImage ? { uri: editImage } : require("@/assets/images/placeholder-food.jpg")}
                    className="w-24 h-24 mb-2 bg-gray-200 rounded-full"
                  />
                  <Text className="text-blue-600 underline">Change Photo</Text>
                </Pressable>

                <Text className="mb-1 font-medium">Username</Text>
                <TextInput
                  className="px-3 py-2 mb-4 border border-gray-300 rounded"
                  value={editUsername}
                  onChangeText={setEditUsername}
                  placeholder="Enter new username"
                />
                {editError && <Text className="mb-2 text-center text-red-600">{editError}</Text>}

                <View className="flex-row justify-between mt-2">
                  <TouchableOpacity
                    className="px-6 py-2 bg-gray-300 rounded-lg"
                    onPress={() => setModalVisible(false)}
                    disabled={editLoading}
                  >
                    <Text className="font-bold text-gray-700">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="px-6 py-2 bg-red-600 rounded-lg"
                    onPress={handleSaveProfile}
                    disabled={editLoading}
                  >
                    {editLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text className="font-bold text-white">Save</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>

        {/* Tab Navigation */}
        <View className="flex-row justify-around py-3 border-b border-gray-200">
          {["My Recipes", "Likes", "Bookmarks"].map((tab) => (
            <TouchableOpacity
              key={tab}
              className={`py-2 px-4 ${activeTab === tab ? "border-b-2 border-[#333]" : ""}`}
              onPress={() => handleTabChange(tab)}
            >
              <Text className={`font-medium ${activeTab === tab ? "font-bold" : ""}`}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {isActiveLoading ? (
          <View className="items-center justify-center flex-1 py-8">
            <ActivityIndicator size="small" color="#bb0718" />
          </View>
        ) : activeError ? (
          <View className="items-center justify-center flex-1 py-8">
            <Text className="font-bold text-center text-red-600">{activeError.message || "Failed to load data"}</Text>
          </View>
        ) : !activeData?.data?.length ? (
          <View className="items-center justify-center flex-1 py-8">
            <Text className="font-medium text-center text-gray-400">No items found</Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap p-2">
            {activeData.data.map((item: Food) => (
              <TouchableOpacity
                key={item.id}
                className="relative w-1/2 p-2"
                onPress={() => handleFoodPress(item.id)}
                activeOpacity={0.7}
              >
                <Image
                  source={item.image_url ? { uri: item.image_url } : require("@/assets/images/placeholder-food.jpg")}
                  className="w-full h-[120px] rounded-lg"
                />
                <View className="absolute px-2 py-1 rounded bottom-4 left-4 bg-opacity-90 bg-white/80">
                  <Text className="text-[#333] font-bold text-xs">{item.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
