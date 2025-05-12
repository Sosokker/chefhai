"use client"
import { supabase } from "@/services/supabase"
import { Feather } from "@expo/vector-icons"
import { useQuery } from "@tanstack/react-query"
import { router } from "expo-router"
import { useState, useEffect } from "react"
import { ActivityIndicator, ScrollView, Text, View, TextInput, TouchableOpacity, Image, Dimensions } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

interface Recipe {
  id: number
  name: string
  description: string
  image_url: string
  created_by: string
  is_shared: boolean
  time_to_cook_minutes?: number
}

const { width } = Dimensions.get("window")
const cardWidth = (width - 32) / 2 // 2 cards per row with 16px padding on each side

export default function RecipesScreen() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([])

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
        .order("created_at", { ascending: false })
      if (error) throw error
      return data ?? []
    },
    staleTime: 1000 * 60,
  })

  // Filter recipes based on search query
  useEffect(() => {
    if (!allRecipes) return

    if (!searchQuery.trim()) {
      setFilteredRecipes(allRecipes)
      return
    }

    const filtered = allRecipes.filter((recipe) => recipe.name.toLowerCase().includes(searchQuery.toLowerCase()))
    setFilteredRecipes(filtered)
  }, [searchQuery, allRecipes])

  const recipes: Recipe[] = filteredRecipes || []
  const loading = isAllLoading
  const error = allError

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#bb0718" />
        <Text className="mt-4 text-gray-600">Loading recipes...</Text>
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-4">
        <Feather name="alert-circle" size={48} color="#bb0718" />
        <Text className="text-lg text-red-600 mt-4 text-center">Failed to load recipes</Text>
        <TouchableOpacity className="mt-6 bg-[#ffd60a] px-6 py-3 rounded-full" onPress={() => router.push("/home")}>
          <Text className="font-bold text-[#bb0718]">Go back to home</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-[#bb0718] mb-4">All Recipes</Text>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2 mb-4">
          <Feather name="search" size={20} color="#bb0718" />
          <TextInput
            className="flex-1 ml-2 text-base"
            placeholder="Search recipes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Feather name="x" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="flex-row flex-wrap px-4 pb-8">
          {recipes.length === 0 ? (
            <View className="w-full items-center justify-center py-16">
              <Feather name="book-open" size={64} color="#e0e0e0" />
              <Text className="text-gray-500 mt-4 text-center">
                {searchQuery.trim() ? `No recipes found for "${searchQuery}"` : "No recipes available."}
              </Text>
            </View>
          ) : (
            recipes.map((item) => (
              <View key={item.id} className="w-1/2 p-2">
                <TouchableOpacity
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100"
                  onPress={() => router.push(`/food/${item.id}`)}
                  activeOpacity={0.7}
                >
                  <View className="w-full h-32 bg-gray-200">
                    {item.image_url ? (
                      <Image
                        source={{ uri: item.image_url }}
                        className="w-full h-full"
                        style={{ resizeMode: "cover" }}
                      />
                    ) : (
                      <View className="w-full h-full items-center justify-center">
                        <Feather name="image" size={32} color="#ccc" />
                      </View>
                    )}
                  </View>
                  <View className="p-3">
                    <Text className="font-bold text-gray-800 mb-1" numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text className="text-xs text-gray-500 mb-2" numberOfLines={2}>
                      {item.description || "No description available"}
                    </Text>
                    {item.time_to_cook_minutes !== undefined && (
                      <View className="flex-row items-center">
                        <Feather name="clock" size={12} color="#bb0718" />
                        <Text className="text-xs text-gray-600 ml-1">{item.time_to_cook_minutes} min</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
