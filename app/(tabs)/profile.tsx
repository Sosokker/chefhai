"use client";

import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/context/auth-context";
import { getFoods } from "@/services/data/foods";
import { getProfile } from "@/services/data/profile";
import { supabase } from "@/services/supabase";
import { useIsFocused } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState("My Recipes");
  const { isAuthenticated } = useAuth();
  const isFocused = useIsFocused();

  const {
    data: userData,
    isLoading: isUserLoading,
    error: userError,
  } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data?.user;
    },
    enabled: isAuthenticated,
    subscribed: isFocused,
  });
  const userId = userData?.id;

  const {
    data: profileData,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) throw new Error("No user id");
      return getProfile(userId);
    },
    enabled: !!userId,
    subscribed: isFocused,
  });

  const {
    data: foodsData,
    isLoading: isFoodsLoading,
    error: foodsError,
  } = useQuery({
    queryKey: ["my-recipes", userId],
    queryFn: async () => {
      if (!userId) throw new Error("No user id");
      return getFoods(userId);
    },
    enabled: !!userId && activeTab === "My Recipes",
    subscribed: isFocused && activeTab === "My Recipes",
  });

  if (isUserLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#bb0718" />
      </SafeAreaView>
    );
  }

  if (userError) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white px-4">
        <Text className="text-red-600 font-bold text-center">
          {userError.message || "Failed to load user data."}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView className="flex-1">
        {/* Profile Header */}
        <View className="items-center py-6">
          <View className="w-[100px] h-[100px] rounded-full border border-gray-300 justify-center items-center mb-3">
            <View className="w-[96px] h-[96px] rounded-full bg-gray-100 justify-center items-center">
              <Text className="text-5xl">👨‍🍳</Text>
            </View>
          </View>
          {isLoading ? (
            <ActivityIndicator
              size="small"
              color="#bb0718"
              style={{ marginBottom: 12 }}
            />
          ) : error ? (
            <Text className="text-xl font-bold mb-3 text-red-600">
              {error.message || error.toString()}
            </Text>
          ) : (
            <Text className="text-xl font-bold mb-3">
              {profileData?.data?.username ?? "-"}
            </Text>
          )}
          <TouchableOpacity className="bg-red-600 py-2 px-10 rounded-lg">
            <Text className="text-white font-bold">Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View className="flex-row justify-around py-3">
          {["My Recipes", "Likes", "Saved"].map((tab) => (
            <TouchableOpacity
              key={tab}
              className={`py-2 px-4 ${
                activeTab === tab ? "border-b-2 border-[#333]" : ""
              }`}
              onPress={() => setActiveTab(tab)}
            >
              <Text className="font-medium">{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="h-px bg-[#EEEEEE] mx-4" />

        {/* Food Grid / Tab Content */}
        {activeTab === "My Recipes" && (
          <View className="flex-row flex-wrap p-2">
            {isFoodsLoading ? (
              <ActivityIndicator
                size="small"
                color="#bb0718"
                style={{ marginTop: 20 }}
              />
            ) : foodsError ? (
              <Text className="text-red-600 font-bold p-4">
                {foodsError.message || foodsError.toString()}
              </Text>
            ) : foodsData?.data?.length ? (
              foodsData.data.map((item, index) => (
                <View key={item.id} className="w-1/2 p-2 relative">
                  <Image
                    source={
                      item.image_url
                        ? { uri: item.image_url }
                        : require("@/assets/images/placeholder-food.jpg")
                    }
                    className="w-full h-[120px] rounded-lg"
                  />
                  <View className="absolute bottom-4 left-4 py-1 px-2 rounded bg-opacity-90 bg-white/80">
                    <Text className="text-[#333] font-bold text-xs">
                      {item.name}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text className="text-gray-400 font-bold p-4">
                No recipes found.
              </Text>
            )}
          </View>
        )}
        {activeTab === "Likes" && (
          <Text className="text-gray-400 font-bold p-4">
            Liked recipes will appear here.
          </Text>
        )}
        {activeTab === "Saved" && (
          <Text className="text-gray-400 font-bold p-4">
            Saved recipes will appear here.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
