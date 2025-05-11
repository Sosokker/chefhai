"use client"

import { IconSymbol } from "@/components/ui/IconSymbol"
import { getFoods, insertGenAIResult } from "@/services/data/foods"
import { uploadImageToSupabase } from "@/services/data/imageUpload"
import { getProfile } from "@/services/data/profile"
import { callGenAIonImage } from "@/services/gemini"
import { supabase } from "@/services/supabase"
import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons"
import { useQuery } from "@tanstack/react-query"
import * as FileSystem from "expo-file-system"
import * as ImagePicker from "expo-image-picker"
import { router } from "expo-router"
import { useMemo, useState, useEffect } from "react"
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native"

const useFoodsQuery = () => {
  return useQuery({
    queryKey: ["highlight-foods"],
    queryFn: async () => {
      const { data, error } = await getFoods(undefined, true, undefined, 4)
      if (error) throw error
      return data || []
    },
    staleTime: 1000 * 60 * 5,
  })
}

const useUserProfile = () => {
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoadingUserId, setIsLoadingUserId] = useState(true)

  // Get current user ID
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const { data, error } = await supabase.auth.getUser()
        if (error) throw error
        setUserId(data?.user?.id || null)
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setIsLoadingUserId(false)
      }
    }

    fetchUserId()
  }, [])

  // Fetch user profile data
  const {
    data: profileData,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) throw new Error("No user id")
      return getProfile(userId)
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  return {
    userId,
    profileData: profileData?.data,
    isLoading: isLoadingUserId || isLoadingProfile,
    error: profileError,
  }
}

const runImagePipeline = async (imageBase64: string, imageType: string, userId: string) => {
  const imageUri = await uploadImageToSupabase(imageBase64, imageType, userId)
  const genAIResult = await callGenAIonImage(imageUri)
  if (genAIResult.error) throw genAIResult.error
  const { data: genAIResultData } = genAIResult
  if (!genAIResultData) throw new Error("GenAI result is null")
  await insertGenAIResult(genAIResultData, userId, imageUri)
}

const processImage = async (asset: ImagePicker.ImagePickerAsset, userId: string) => {
  const base64 = await FileSystem.readAsStringAsync(asset.uri, {
    encoding: "base64",
  })
  const imageType = asset.mimeType || "image/jpeg"
  await runImagePipeline(base64, imageType, userId)
}

const navigateToFoodDetail = (foodId: string) => {
  router.push({ pathname: "/recipe-detail", params: { id: foodId } })
}

const handleImageSelection = async (
  pickerFn: typeof ImagePicker.launchCameraAsync | typeof ImagePicker.launchImageLibraryAsync,
) => {
  const result = await pickerFn({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  })

  if (!result.canceled) {
    try {
      const { data, error } = await supabase.auth.getUser()
      if (error || !data?.user?.id) throw new Error("Cannot get user id")
      const userId = data.user.id
      await processImage(result.assets[0], userId)
    } catch (err) {
      Alert.alert("Image Processing Failed", (err as Error).message || "Unknown error")
    }
    router.push({
      pathname: "/recipe-detail",
      params: {
        title: "My New Recipe",
        image: result.assets[0].uri,
      },
    })
  }
}

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("")
  const { data: foodsData = [], isLoading: isLoadingFoods, error: foodsError } = useFoodsQuery()
  const { profileData, isLoading: isLoadingProfile, userId } = useUserProfile()

  const filteredFoods = useMemo(() => {
    return searchQuery
      ? foodsData.filter((food) => food.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : foodsData
  }, [foodsData, searchQuery])

  // Get username or fallback to a default greeting
  const username = profileData?.username || profileData?.full_name || "Chef"
  const greeting = `Hi! ${username}`

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        {isLoadingProfile ? (
          <View className="flex-row items-center">
            <Text className="mr-2 text-3xl font-bold">Hi!</Text>
            <ActivityIndicator size="small" color="#bb0718" />
          </View>
        ) : (
          <Text className="text-3xl font-bold">{greeting}</Text>
        )}
        <View className="bg-[#ffd60a] p-3 rounded-lg">
          <Ionicons name="settings-outline" size={24} color="black" />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Main content container with consistent padding */}
        <View className="px-6">
          {/* "Show your dishes" section */}
          <View className="mb-6">
            <View className="flex-row items-center mb-4">
              <Text className="mr-2 text-2xl font-bold">Show your dishes</Text>
              <Feather name="wifi" size={20} color="black" />
            </View>

            <View className="flex-row items-center px-4 py-3 mb-6 bg-white border border-gray-300 rounded-full">
              <TextInput className="flex-1" placeholder="Search..." value={searchQuery} onChangeText={setSearchQuery} />
              <View className="bg-[#ffd60a] p-2 rounded-full">
                <Feather name="send" size={20} color="black" />
              </View>
            </View>
          </View>

          {/* Upload feature section */}
          <View className="mb-8">
            <View className="flex-row justify-between">
              <TouchableOpacity
                className="bg-[#ffd60a] p-4 rounded-xl w-[48%]"
                onPress={async () => {
                  const { status } = await ImagePicker.requestCameraPermissionsAsync()
                  if (status !== "granted") {
                    Alert.alert("Permission needed", "Please grant camera permissions.")
                    return
                  }
                  await handleImageSelection(ImagePicker.launchCameraAsync)
                }}
              >
                <View className="items-center">
                  <FontAwesome name="camera" size={24} color="black" />
                  <Text className="mt-2 text-lg font-bold">From Camera</Text>
                  <Text className="text-sm text-gray-700">Straight from Camera</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-[#f9be25] p-4 rounded-xl w-[48%]"
                onPress={async () => {
                  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
                  if (status !== "granted") {
                    Alert.alert("Permission needed", "Please grant gallery permissions.")
                    return
                  }
                  await handleImageSelection(ImagePicker.launchImageLibraryAsync)
                }}
              >
                <View className="items-center">
                  <Feather name="image" size={24} color="black" />
                  <Text className="mt-2 text-lg font-bold">From Gallery</Text>
                  <Text className="text-sm text-gray-700">Straight from Gallery</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Highlights section */}
          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <Text className="mr-2 text-2xl font-bold">Highlights</Text>
              <Ionicons name="star-outline" size={20} color="#bb0718" />
            </View>
            {isLoadingFoods ? (
              <Text className="text-center text-gray-500">Loading highlights...</Text>
            ) : foodsError ? (
              <Text className="text-center text-red-600">Failed to load highlights</Text>
            ) : filteredFoods.length === 0 ? (
              <Text className="text-center text-gray-400">No highlights available</Text>
            ) : (
              <View className="flex-row justify-between">
                {filteredFoods.map((food, idx) => (
                  <TouchableOpacity
                    key={food.id}
                    className="flex-1 mr-4 bg-white shadow-sm rounded-xl"
                    style={{
                      marginRight: idx === filteredFoods.length - 1 ? 0 : 12,
                    }}
                    onPress={() => navigateToFoodDetail(food.id)}
                  >
                    {food.image_url ? (
                      <Image source={{ uri: food.image_url }} className="w-full h-32 rounded-t-xl" resizeMode="cover" />
                    ) : (
                      <View className="items-center justify-center w-full h-32 bg-gray-200 rounded-t-xl">
                        <Text className="text-gray-400">No Image</Text>
                      </View>
                    )}
                    <View className="justify-between flex-1 p-3">
                      <Text className="text-base font-bold text-[#333] mb-1" numberOfLines={1}>
                        {food.name}
                      </Text>
                      <Text className="text-sm text-[#666] mb-2" numberOfLines={1}>
                        {food.description || "No description"}
                      </Text>
                      <View className="flex-row justify-between">
                        <View className="flex-row items-center">
                          <IconSymbol name="clock" size={12} color="#666" />
                          <Text className="text-xs text-[#666] ml-1">
                            {food.time_to_cook_minutes ? `${food.time_to_cook_minutes} min` : "-"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Extra space at bottom */}
        <View className="h-20"></View>
      </ScrollView>
    </SafeAreaView>
  )
}
