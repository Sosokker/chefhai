"use client"
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
import { useEffect, useState } from "react"
import { Alert, Image, SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native"

const useFoodsQuery = () => {
  return useQuery({
    queryKey: ["highlight-foods"],
    queryFn: async () => {
      const { data, error } = await getFoods(undefined, true, undefined, 6) // Fetch 6 items for multiple rows
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
  router.push({ pathname: "/food/[id]", params: { id: foodId } })
}

export default function HomeScreen() {
  const [imageProcessing, setImageProcessing] = useState(false)
  const { profileData } = useUserProfile()
  const { data: foodsData = [], isLoading: isLoadingFoods, error: foodsError } = useFoodsQuery()

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
      setImageProcessing(true)
      try {
        const { data, error } = await supabase.auth.getUser()
        if (error || !data?.user?.id) throw new Error("Cannot get user id")
        const userId = data.user.id
        await processImage(result.assets[0], userId)
      } catch (err) {
        Alert.alert("Image Processing Failed", (err as Error).message || "Unknown error")
      } finally {
        setImageProcessing(false)
      }
      router.push({
        pathname: "/profile",
      })
    }
  }

  // Get username or fallback to a default greeting
  const username = profileData?.username || profileData?.full_name || "Chef"
  const greeting = `Hi! ${username}`

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      {imageProcessing && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255,255,255,0.7)",
            zIndex: 9999,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              padding: 24,
              borderRadius: 16,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>Processing image...</Text>
            <View style={{ marginBottom: 8 }}>
              <FontAwesome name="spinner" size={36} color="#ffd60a" style={{}} />
            </View>
            <Text style={{ color: "#888" }}>Please wait</Text>
          </View>
        </View>
      )}

      {/* Header with greeting only (settings button removed) */}
      <View className="px-6 pt-4 pb-2">
        <Text className="text-3xl font-bold">{greeting}</Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Main content container with consistent padding */}
        <View className="px-6">
          {/* "Show your dishes" section - Search bar removed */}
          <View className="mb-6">
            <View className="flex-row items-center mb-4">
              <Text className="mr-2 text-2xl font-bold">Show your dishes</Text>
              <Feather name="wifi" size={20} color="black" />
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
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <Text className="mr-2 text-2xl font-bold">Highlights</Text>
                <Ionicons name="star-outline" size={20} color="#bb0718" />
              </View>
              <TouchableOpacity onPress={() => router.push("/recipes")}>
                <Text className="text-[#bb0718] font-medium">See All</Text>
              </TouchableOpacity>
            </View>

            {isLoadingFoods ? (
              <View className="items-center justify-center py-8">
                <FontAwesome name="spinner" size={24} color="#ffd60a" />
                <Text className="text-center text-gray-500 mt-2">Loading highlights...</Text>
              </View>
            ) : foodsError ? (
              <View className="items-center justify-center py-8">
                <Feather name="alert-circle" size={24} color="#bb0718" />
                <Text className="text-center text-red-600 mt-2">Failed to load highlights</Text>
              </View>
            ) : foodsData.length === 0 ? (
              <View className="items-center justify-center py-8">
                <Feather name="coffee" size={24} color="#888" />
                <Text className="text-center text-gray-400 mt-2">No highlights available</Text>
              </View>
            ) : (
              <View className="flex-row flex-wrap justify-between">
                {foodsData.map((food, idx) => (
                  <TouchableOpacity
                    key={food.id}
                    className="bg-[#f8f8f8] p-4 rounded-xl w-[48%] mb-4"
                    onPress={() => navigateToFoodDetail(food.id)}
                  >
                    <View className="items-center">
                      {food.image_url ? (
                        <Image
                          source={{ uri: food.image_url }}
                          style={{ width: 60, height: 60, borderRadius: 30 }}
                          resizeMode="cover"
                        />
                      ) : (
                        <View
                          style={{
                            width: 60,
                            height: 60,
                            borderRadius: 30,
                            backgroundColor: "#e0e0e0",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Feather name="image" size={24} color="#bbb" />
                        </View>
                      )}
                      <Text className="mt-2 text-lg font-bold text-center" numberOfLines={1}>
                        {food.name}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <Feather name="clock" size={14} color="#666" />
                        <Text className="text-sm text-gray-700 ml-1">
                          {food.time_to_cook_minutes ? `${food.time_to_cook_minutes} min` : "-"}
                        </Text>
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
