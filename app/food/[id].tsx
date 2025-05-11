"use client"
import { getFoodById, getIngredients, getNutrients } from "@/services/data/foods"
import { supabase } from "@/services/supabase"
import type { Foods } from "@/types"
import type { Ingredient, Nutrient } from "@/types/index"
import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons"
import { useQuery } from "@tanstack/react-query"
import { Image } from "expo-image"
import { router, useLocalSearchParams } from "expo-router"
import { useRef } from "react"
import { ScrollView, Text, TouchableOpacity, View, ActivityIndicator, Animated, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"

interface Step {
  id: string
  food_id: string
  title: string
  step_order: number
  description: string
  created_at: string
}

const { width } = Dimensions.get("window")

export default function FoodDetailScreen() {
  const { id } = useLocalSearchParams()
  const scrollY = useRef(new Animated.Value(0)).current

  const foodId = typeof id === "string" ? id : ""

  const {
    data: foodData,
    isLoading,
    error,
  } = useQuery<Foods, Error>({
    queryKey: ["food-detail", foodId],
    queryFn: async () => {
      const { data, error } = await getFoodById(foodId)
      if (error) throw error
      if (!data) throw new Error("Food not found")
      return data
    },
    enabled: !!foodId,
  })

  const {
    data: nutrients,
    isLoading: nutrientsLoading,
    error: nutrientsError,
  } = useQuery<Nutrient | null, Error>({
    queryKey: ["food-nutrients", foodId],
    queryFn: async () => {
      const { data, error } = await getNutrients(foodId)
      if (error) throw error
      return data
    },
    enabled: !!foodId && !!foodData,
  })

  const {
    data: ingredients,
    error: ingredientsError,
    isLoading: ingredientsLoading,
  } = useQuery<Ingredient[], Error>({
    queryKey: ["food-ingredients", foodId],
    queryFn: async () => {
      const { data, error } = await getIngredients(foodId)
      if (error) throw error
      return data ?? []
    },
    enabled: !!foodId && !!foodData,
  })

  const {
    data: steps,
    isLoading: stepsLoading,
    error: stepsError,
  } = useQuery<Step[], Error>({
    queryKey: ["food-steps", foodId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cooking_steps")
        .select(
          `
          id,
          food_id,
          title,
          step_order,
          description,
          created_at
          `,
        )
        .eq("food_id", foodId)
        .order("step_order", { ascending: true })
      if (error) throw error
      return data ?? []
    },
    enabled: !!foodId && !!foodData,
  })

  // Calculate header opacity based on scroll position
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100, 150],
    outputRange: [0, 0.5, 1],
    extrapolate: "clamp",
  })

  // Calculate image scale based on scroll position
  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0, 100],
    outputRange: [1.2, 1, 0.8],
    extrapolate: "clamp",
  })

  if (isLoading || stepsLoading || nutrientsLoading || ingredientsLoading) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <ActivityIndicator size="large" color="#bb0718" />
        <Text className="mt-4 font-medium text-gray-600">Loading recipe details...</Text>
      </View>
    )
  }

  if (error || !foodData || ingredientsError || stepsError || nutrientsError) {
    return (
      <View className="items-center justify-center flex-1 px-6 bg-white">
        <Ionicons name="alert-circle-outline" size={64} color="#bb0718" />
        <Text className="mt-4 mb-2 text-xl font-bold text-center text-gray-800">Oops! Something went wrong</Text>
        <Text className="mb-6 text-base text-center text-gray-600">
          We couldn't load the recipe details. Please try again later.
        </Text>
        <TouchableOpacity className="px-6 py-3 bg-[#ffd60a] rounded-full" onPress={() => router.push("/home")}>
          <Text className="text-lg font-bold text-[#bb0718]">Go back to home</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const startCookingSession = () => {
    router.push(`/cooking/${foodId}`)
  }

  // Recipe info cards data
  const recipeInfoCards = [
    {
      id: "skill_level",
      title: "Skill Level",
      icon: <MaterialCommunityIcons name="chef-hat" size={22} color="#4CAF50" />,
      value: foodData.skill_level || "Easy",
      color: "#4CAF50",
    },
    {
      id: "cooking_time",
      title: "Cooking Time",
      icon: <Feather name="clock" size={22} color="#bb0718" />,
      value: `${foodData.time_to_cook_minutes || 0} min`,
      color: "#bb0718",
    },
    {
      id: "ingredients",
      title: "Ingredients",
      icon: <Feather name="list" size={22} color="#2196F3" />,
      value: `${foodData.ingredient_count ?? ingredients?.length ?? 0}`,
      color: "#2196F3",
    },
    {
      id: "calories",
      title: "Calories",
      icon: <Ionicons name="flame" size={22} color="#F44336" />,
      value: `${foodData.calories || 0} kcal`,
      color: "#F44336",
    },
  ]

  return (
    <View className="flex-1 mt-16">
      {/* Animated header background */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 90,
          // backgroundColor: "white",
          opacity: headerOpacity,
          zIndex: 10,
          // shadowColor: "#000",
          // shadowOffset: { width: 0, height: 2 },
          // shadowOpacity: 0.1,
          // shadowRadius: 4,
          elevation: 5,
        }}
      />

      {/* Header with back and share buttons */}
      <View className="absolute top-0 left-0 right-0 z-20 flex-row justify-between px-4 py-3">
        <TouchableOpacity
          className="p-3 rounded-full shadow-sm bg-white/80 backdrop-blur-md"
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color="#bb0718" />
        </TouchableOpacity>
        <TouchableOpacity className="p-3 rounded-full shadow-sm bg-white/80 backdrop-blur-md">
          <Feather name="share-2" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
      >
        {/* Food Image with gradient overlay */}
        <Animated.View
          style={{
            height: 350,
            width: "100%",
            transform: [{ scale: imageScale }],
            overflow: "hidden",
          }}
        >
          <Image
            source={{ uri: foodData.image_url || "/vibrant-food-dish.png" }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 150,
            }}
          />
          <View className="absolute bottom-8 left-6 right-6">
            <Text className="mb-2 text-3xl font-bold text-white">{foodData.name}</Text>
            <View className="flex-row items-center">
              <View className="bg-[#ffd60a] px-3 py-1 rounded-full">
                <Text className="text-sm font-bold text-[#bb0718]">{foodData.skill_level || "Easy"}</Text>
              </View>
              <View className="px-3 py-1 ml-2 rounded-full bg-white/30">
                <Text className="text-sm font-bold text-white">{foodData.time_to_cook_minutes || 0} min</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <View className="px-6 pt-8 pb-24">
          {/* Description */}
          {foodData.description && (
            <Text className="mb-8 text-base leading-6 text-gray-700">{foodData.description}</Text>
          )}

          {/* Recipe Info Cards - Horizontal Scrollable */}
          <View className="mb-10">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20 }}
              className="mb-2"
            >
              {recipeInfoCards.map((card) => (
                <View
                  key={card.id}
                  className="p-5 mr-4 bg-white border border-gray-100 rounded-2xl"
                  style={{ width: 130 }}
                >
                  <View className="items-center">
                    {card.icon}
                    <Text className="mt-2 text-sm font-medium text-gray-500">{card.title}</Text>
                    <Text className="mt-1 text-xl font-bold" style={{ color: card.color }}>
                      {card.value}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Ingredients Section */}
          <View className="mb-10">
            <Text className="mb-5 text-2xl font-bold text-gray-800">Ingredients</Text>
            <View className="bg-white border border-gray-100 shadow-sm rounded-2xl">
              {ingredients && ingredients.length > 0 ? (
                <View className="flex-row flex-wrap justify-between p-4">
                  {ingredients.map((ingredient, index) => (
                    <View key={ingredient.id || index} className="w-[30%] items-center mb-6">
                      <View className="items-center justify-center w-16 h-16 mb-2 rounded-full bg-gray-50">
                        <Text className="text-3xl">{ingredient.emoji || "🍴"}</Text>
                      </View>
                      <Text className="text-sm font-medium text-center text-gray-800">{ingredient.name}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="items-center py-8">
                  <Feather name="shopping-bag" size={40} color="#e0e0e0" />
                  <Text className="mt-2 text-center text-gray-400">No ingredients listed</Text>
                </View>
              )}
            </View>
          </View>

          {/* Nutrition Section */}
          {nutrients && (
            <View className="mb-10">
              <Text className="mb-5 text-2xl font-bold text-gray-800">Nutrition Facts</Text>
              <View className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
                <View className="flex-row justify-between">
                  <NutrientCircle
                    value={nutrients.protein_g ?? 0}
                    label="Protein"
                    color="#2196F3"
                    bgColor="#2196F3/10"
                  />
                  <NutrientCircle value={nutrients.carbs_g ?? 0} label="Carbs" color="#F44336" bgColor="#F44336/10" />
                  <NutrientCircle value={nutrients.fat_g ?? 0} label="Fat" color="#FFD700" bgColor="#FFD700/10" />
                  <NutrientCircle value={nutrients.fiber_g ?? 0} label="Fiber" color="#4CAF50" bgColor="#4CAF50/10" />
                </View>
              </View>
            </View>
          )}

          {/* Steps Preview */}
          <View className="mb-8">
            <Text className="mb-5 text-2xl font-bold text-gray-800">Cooking Steps</Text>
            <View className="bg-white border border-gray-100 shadow-sm rounded-2xl">
              {steps && steps.length > 0 ? (
                <View className="p-4">
                  {steps.slice(0, 3).map((step, index) => (
                    <View key={step.id || index} className="flex-row mb-6 last:mb-0">
                      <View className="w-10 h-10 rounded-full bg-[#ffd60a] justify-center items-center mr-4">
                        <Text className="text-base font-bold text-[#bb0718]">{step.step_order ?? index + 1}</Text>
                      </View>
                      <View className="flex-1">
                        {step.title && <Text className="mb-1 text-base font-bold text-gray-800">{step.title}</Text>}
                        <Text className="text-base text-gray-700">
                          {step.description || "No description available"}
                        </Text>
                      </View>
                    </View>
                  ))}
                  {steps.length > 3 && (
                    <TouchableOpacity
                      className="items-center py-3 mt-4 border-t border-gray-100"
                      onPress={startCookingSession}
                    >
                      <Text className="text-[#bb0718] font-bold">View all {steps.length} steps</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View className="items-center py-8">
                  <Feather name="list" size={40} color="#e0e0e0" />
                  <Text className="mt-2 text-center text-gray-400">No cooking steps available</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Animated.ScrollView>

      {/* Cook Button */}
      <View className="absolute bottom-0 left-0 right-0 px-6 pt-4 pb-8 bg-white border-t border-gray-100 shadow-lg">
        <TouchableOpacity
          className="bg-[#bb0718] rounded-full py-4 flex-row justify-center items-center"
          onPress={startCookingSession}
        >
          <Text className="mr-2 text-lg font-bold text-white">Let's Cook!</Text>
          <MaterialCommunityIcons name="chef-hat" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

// Helper component for nutrition facts
function NutrientCircle({
  value,
  label,
  color,
  bgColor,
}: { value: number; label: string; color: string; bgColor: string }) {
  return (
    <View className="items-center">
      <View
        className="items-center justify-center w-16 h-16 mb-2 rounded-full"
        style={{ backgroundColor: bgColor.replace("/", "-") }}
      >
        <Text className="text-xl font-bold" style={{ color }}>
          {value}g
        </Text>
      </View>
      <Text className="text-sm font-medium text-gray-700">{label}</Text>
    </View>
  )
}
