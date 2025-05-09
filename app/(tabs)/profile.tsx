"use client";

import { useAuth } from "@/context/auth-context";
import { getFoods } from "@/services/data/foods";
import { getProfile, updateProfile } from "@/services/data/profile";
import { supabase } from "@/services/supabase";
import { useIsFocused } from "@react-navigation/native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import uuid from "react-native-uuid";

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState("My Recipes");
  const { isAuthenticated } = useAuth();
  const isFocused = useIsFocused();
  const queryClient = useQueryClient();

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
    staleTime: 0,
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
    staleTime: 0,
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
    staleTime: 0,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editImage, setEditImage] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setEditError("Permission to access media library is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.canceled) {
      setEditImage(result.assets[0].uri);
    }
  };

  const uploadImageToSupabase = async (uri: string): Promise<string> => {
    const fileName = `${userId}/${uuid.v4()}.jpg`;
    const response = await fetch(uri);
    const blob = await response.blob();

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, blob, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSaveProfile = async () => {
    setEditLoading(true);
    setEditError(null);

    try {
      if (!editUsername.trim()) throw new Error("Username cannot be empty");

      let avatarUrl = profileData?.data?.avatar_url ?? null;

      if (editImage && editImage !== avatarUrl) {
        avatarUrl = await uploadImageToSupabase(editImage);
      }

      const { error: updateError } = await updateProfile(
        userId!,
        editUsername.trim(),
        avatarUrl
      );
      if (updateError) throw updateError;

      setModalVisible(false);
      await queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    } catch (err: any) {
      setEditError(err.message || "Failed to update profile");
    } finally {
      setEditLoading(false);
    }
  };

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
            <Text className="text-red-600 font-bold mb-3">
              {error.message || error.toString()}
            </Text>
          ) : (
            <Text className="text-xl font-bold mb-3">
              {profileData?.data?.username ?? "-"}
            </Text>
          )}
          <TouchableOpacity
            className="bg-red-600 py-2 px-10 rounded-lg"
            onPress={() => {
              setEditUsername(profileData?.data?.username ?? "");
              setEditImage(profileData?.data?.avatar_url ?? null);
              setEditError(null);
              setModalVisible(true);
            }}
          >
            <Text className="text-white font-bold">Edit</Text>
          </TouchableOpacity>

          {/* Edit Modal */}
          <Modal
            visible={modalVisible}
            animationType="slide"
            transparent
            onRequestClose={() => setModalVisible(false)}
          >
            <View className="flex-1 justify-center items-center bg-black bg-opacity-40">
              <View className="bg-white rounded-xl p-6 w-11/12 max-w-md shadow-lg">
                <Text className="text-lg font-bold mb-4 text-center">
                  Edit Profile
                </Text>

                <Pressable className="items-center mb-4" onPress={pickImage}>
                  <Image
                    source={
                      editImage
                        ? { uri: editImage }
                        : require("@/assets/images/placeholder-food.jpg")
                    }
                    className="w-24 h-24 rounded-full mb-2 bg-gray-200"
                  />
                  <Text className="text-blue-600 underline">Change Photo</Text>
                </Pressable>

                <Text className="mb-1 font-medium">Username</Text>
                <TextInput
                  className="border border-gray-300 rounded px-3 py-2 mb-4"
                  value={editUsername}
                  onChangeText={setEditUsername}
                  placeholder="Enter new username"
                />
                {editError && (
                  <Text className="text-red-600 mb-2 text-center">
                    {editError}
                  </Text>
                )}

                <View className="flex-row justify-between mt-2">
                  <TouchableOpacity
                    className="bg-gray-300 py-2 px-6 rounded-lg"
                    onPress={() => setModalVisible(false)}
                    disabled={editLoading}
                  >
                    <Text className="text-gray-700 font-bold">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-red-600 py-2 px-6 rounded-lg"
                    onPress={handleSaveProfile}
                    disabled={editLoading}
                  >
                    {editLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text className="text-white font-bold">Save</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
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

        {/* Recipes */}
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
              foodsData.data.map((item) => (
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
      </ScrollView>
    </SafeAreaView>
  );
}
