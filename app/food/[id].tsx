"use client";

import { IconSymbol } from "@/components/ui/IconSymbol";
import {
  getFoodById,
  getIngredients,
  getNutrients,
} from "@/services/data/foods";
import { supabase } from "@/services/supabase";
import { Foods } from "@/types";
import { Ingredient, Nutrient } from "@/types/index";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Step {
  id: string;
  food_id: string;
  title: string;
  step_order: number;
  description: string;
  created_at: string;
}

export default function FoodDetailScreen() {
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState("Ingredients");

  const foodId = typeof id === "string" ? id : "";

  const {
    data: foodData,
    isLoading,
    error,
  } = useQuery<Foods, Error>({
    queryKey: ["food-detail", foodId],
    queryFn: async () => {
      const { data, error } = await getFoodById(foodId);
      if (error) throw error;
      if (!data) throw new Error("Food not found");
      return data;
    },
    enabled: !!foodId,
  });

  const {
    data: nutrients,
    isLoading: nutrientsLoading,
    error: nutrientsError,
  } = useQuery<Nutrient | null, Error>({
    queryKey: ["food-nutrients", foodId],
    queryFn: async () => {
      const { data, error } = await getNutrients(foodId);
      if (error) throw error;
      return data;
    },
    enabled: !!foodId && !!foodData,
  });

  const {
    data: ingredients,
    error: ingredientsError,
    isLoading: ingredientsLoading,
  } = useQuery<Ingredient[], Error>({
    queryKey: ["food-ingredients", foodId],
    queryFn: async () => {
      const { data, error } = await getIngredients(foodId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!foodId && !!foodData,
  });

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
          `
        )
        .eq("food_id", foodId)
        .order("step_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!foodId && !!foodData,
  });

  if (isLoading || stepsLoading || nutrientsLoading || ingredientsLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-1 justify-center items-center">
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !foodData || ingredientsError || stepsError || nutrientsError) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-1 justify-center items-center">
          <Text>Error loading food details</Text>
          <TouchableOpacity
            className="px-4 py-2 bg-yellow-400 rounded-full mt-4"
            onPress={() => router.push("/home")}
          >
            <Text className="text-lg font-bold text-white">
              Go back to home page
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const startCookingSession = () => {
    // Corrected router push to use the actual foodId
    router.push(`/cooking/${foodId}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1">
          {/* Header with back and share buttons */}
          <View className="flex-row justify-between px-4 py-3 absolute top-0 left-0 right-0 z-10">
            <TouchableOpacity
              className="bg-[#ffd60a] p-3 rounded-lg"
              onPress={() => router.back()}
            >
              <Feather name="arrow-left" size={24} color="#bb0718" />
            </TouchableOpacity>
            <TouchableOpacity className="w-10 h-10 rounded-full bg-white justify-center items-center">
              <IconSymbol
                name="square.and.arrow.up"
                size={24}
                color="#FFCC00"
              />
            </TouchableOpacity>
          </View>

          {/* Food Image */}
          <View className="items-center mt-16 mb-5">
            <View
              style={{
                width: 200,
                height: 200,
                backgroundColor: "#e0e0e0",
                borderRadius: 24,
                overflow: "hidden",
              }}
            >
              {foodData.image_url ? (
                <Image
                  source={{ uri: foodData.image_url }}
                  className="w-52 h-52 rounded-full border-4 border-white"
                  style={{ width: "100%", height: "100%" }}
                />
              ) : (
                <Text className="text-lg font-bold text-gray-500">
                  Image not available
                </Text>
              )}
            </View>
          </View>

          {/* Food Title and Description */}
          <View className="px-4">
            <Text className="text-2xl font-bold text-gray-800 mb-2">
              {foodData.name}
            </Text>
            <Text className="text-base text-gray-500 mb-5 leading-6">
              {foodData.description}
            </Text>

            {/* Info Tabs */}
            <View className="flex-row justify-between mb-5">
              <TouchableOpacity
                className="items-center"
                onPress={() => setActiveTab("Skills")}
              >
                <Text className="text-sm text-gray-500">Skills</Text>
                <Text className="text-base font-bold text-gray-800 mt-1">
                  {foodData.skill_level}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="items-center"
                onPress={() => setActiveTab("Time")}
              >
                <Text className="text-sm text-gray-500">Time</Text>
                <Text className="text-base font-bold text-gray-800 mt-1">
                  {foodData.time_to_cook_minutes}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`items-center ${
                  activeTab === "Ingredients"
                    ? "border-b-2 border-gray-800"
                    : ""
                }`}
                onPress={() => setActiveTab("Ingredients")}
              >
                <Text className="text-sm text-gray-500">Ingredients</Text>
                <Text className="text-base font-bold text-gray-800 mt-1">
                  {/* Use ingredient_count from foodData or length of the fetched ingredients array */}
                  {foodData.ingredient_count ?? ingredients?.length ?? 0}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="items-center"
                onPress={() => setActiveTab("Calories")}
              >
                <Text className="text-sm text-gray-500">Calories</Text>
                <Text className="text-base font-bold text-gray-800 mt-1">
                  {foodData.calories}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Ingredients Section */}
            <View className="mb-5">
              <Text className="text-xl font-bold text-gray-800 mb-4">
                Ingredients
              </Text>
              <View className="flex-row flex-wrap">
                {(ingredients ?? []).map(
                  // Use the 'ingredients' state variable
                  (
                    ingredient: Ingredient,
                    index: number // Added type for ingredient
                  ) => (
                    <View
                      key={ingredient.id || index}
                      className="w-1/4 items-center mb-4"
                    >
                      <View className="w-15 h-15 rounded-full bg-gray-100 justify-center items-center mb-2 shadow">
                        <Text className="text-2xl">{ingredient.emoji}</Text>
                      </View>
                      <Text className="text-xs text-center text-gray-800">
                        {ingredient.name}
                      </Text>
                    </View>
                  )
                )}
                {/* You might want to show a loading/empty state for ingredients here too */}
                {/*!ingredientsLoading && ingredients?.length === 0 && (
                <Text className="text-sm text-gray-500">No ingredients listed.</Text>
              )*/}
              </View>
            </View>

            {/* Nutrition Section - Improved UI */}
            <View className="mb-5">
              <Text className="text-xl font-bold text-gray-800 mb-4">
                Nutrition Facts
              </Text>
              {/* Conditionally render nutrients or show placeholder/loading */}
              {nutrients ? (
                <View className="flex-row justify-between bg-white rounded-xl p-4 shadow">
                  <View className="items-center">
                    <View
                      className="w-15 h-15 rounded-full justify-center items-center mb-2"
                      style={{ backgroundColor: "#FFD700" }}
                    >
                      <Text className="text-lg font-bold text-gray-800">
                        {nutrients.fat_g ?? 0}
                      </Text>
                      <Text className="text-xs text-gray-800 absolute bottom-2.5 right-2.5">
                        g
                      </Text>
                    </View>
                    <Text className="text-sm font-medium text-gray-800">
                      Fat
                    </Text>
                  </View>
                  <View className="items-center">
                    <View
                      className="w-15 h-15 rounded-full justify-center items-center mb-2"
                      style={{ backgroundColor: "#90EE90" }}
                    >
                      <Text className="text-lg font-bold text-gray-800">
                        {nutrients.fiber_g ?? 0}
                      </Text>
                      <Text className="text-xs text-gray-800 absolute bottom-2.5 right-2.5">
                        g
                      </Text>
                    </View>
                    <Text className="text-sm font-medium text-gray-800">
                      Fiber
                    </Text>
                  </View>
                  <View className="items-center">
                    <View
                      className="w-15 h-15 rounded-full justify-center items-center mb-2"
                      style={{ backgroundColor: "#ADD8E6" }}
                    >
                      <Text className="text-lg font-bold text-gray-800">
                        {nutrients.protein_g ?? 0}
                      </Text>
                      <Text className="text-xs text-gray-800 absolute bottom-2.5 right-2.5">
                        g
                      </Text>
                    </View>
                    <Text className="text-sm font-medium text-gray-800">
                      Protein
                    </Text>
                  </View>
                  <View className="items-center">
                    <View
                      className="w-15 h-15 rounded-full justify-center items-center mb-2"
                      style={{ backgroundColor: "#FFA07A" }}
                    >
                      <Text className="text-lg font-bold text-gray-800">
                        {nutrients.carbs_g ?? 0}
                      </Text>
                      <Text className="text-xs text-gray-800 absolute bottom-2.5 right-2.5">
                        g
                      </Text>
                    </View>
                    <Text className="text-sm font-medium text-gray-800">
                      Carbs
                    </Text>
                  </View>
                </View>
              ) : (
                <Text className="text-sm text-gray-500">
                  Nutrition facts not available.
                </Text>
              )}
            </View>

            {/* Steps Preview */}
            <View className="mb-5">
              <Text className="text-xl font-bold text-gray-800 mb-4">
                Cooking Steps
              </Text>
              <View className="bg-gray-100 rounded-xl p-4">
                {steps && steps.length > 0 ? (
                  steps.slice(0, 2).map(
                    (
                      step: Step,
                      index: number // Added type for step
                    ) => (
                      <View
                        key={step.id || index}
                        className="flex-row items-center mb-3"
                      >
                        <View className="w-7.5 h-7.5 rounded-full bg-yellow-400 justify-center items-center mr-3">
                          <Text className="text-base font-bold text-gray-800">
                            {step.step_order ?? index + 1}{" "}
                            {/* Use step_order or fallback to index */}
                          </Text>
                        </View>
                        <Text className="text-base text-gray-800 flex-1">
                          {step.description || step.title}{" "}
                          {/* Display description or title */}
                        </Text>
                      </View>
                    )
                  )
                ) : (
                  <Text className="text-sm text-gray-500 italic text-center mt-2">
                    No cooking steps listed
                  </Text>
                )}
                {steps && steps.length > 2 && (
                  <Text className="text-sm text-gray-500 italic text-center mt-2">
                    ...and {steps.length - 2} more steps
                  </Text>
                )}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Cook Button */}
        <TouchableOpacity
          className="absolute bottom-0 left-0 right-0 bg-red-600 flex-row justify-center items-center py-4"
          onPress={startCookingSession}
          // Disable button if essential data is missing or still loading
          // disabled={isLoading || ingredientsLoading || stepsLoading || !ingredients || !steps}
        >
          <Text className="text-lg font-bold text-yellow-400 mr-2">
            Let&apos;s Cook!
          </Text>
          <IconSymbol name="fork.knife" size={20} color="#FFCC00" />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
