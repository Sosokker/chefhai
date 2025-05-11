"use client";

import RecipeHighlightCard from "@/components/RecipeHighlightCard";
import { supabase } from "@/services/supabase";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Recipe {
  id: number;
  name: string;
  description: string;
  image_url: string;
  created_by: string;
  is_shared: boolean;
  time_to_cook_minutes?: number;
}

export default function RecipesScreen() {
  const {
    data: allRecipes,
    isLoading: isAllLoading,
    error: allError,
  } = useQuery<Recipe[], Error>({
    queryKey: ["all-recipes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("foods")
        .select("*")
        .eq("is_shared", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 60,
  });

  const recipes: Recipe[] = allRecipes || [];
  const loading = isAllLoading;
  const error = allError;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#FFCC00" />
      </SafeAreaView>
    );
  }
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-lg text-red-600">Failed to load recipes</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <Text className="text-2xl font-bold text-[#bb0718] mx-4 mt-6 mb-4">
        All Recipes
      </Text>
      <ScrollView className="flex-1">
        <View className="flex-row flex-wrap px-2 pb-8">
          {recipes.length === 0 ? (
            <View className="w-full items-center mt-10">
              <Text className="text-gray-500">No recipes found.</Text>
            </View>
          ) : (
            recipes.map((item, idx) => (
              <View key={item.id} className="w-1/2 p-2">
                <RecipeHighlightCard
                  recipe={{
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    image_url: item.image_url,
                    time_to_cook_minutes: item.time_to_cook_minutes,
                  }}
                  onPress={() => {
                    router.push(`/food/${item.id}`);
                  }}
                />
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
