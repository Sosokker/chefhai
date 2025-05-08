"use client";

import { Image } from "expo-image";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState("Repost");

  const foodItems = [
    {
      id: 1,
      name: "Padthaipro",
      image: require("@/assets/images/food/padthai.jpg"),
      color: "#FFCC00",
    },
    {
      id: 2,
      name: "Jjajangmyeon",
      image: require("@/assets/images/food/jjajangmyeon.jpg"),
      color: "#FFA500",
    },
    {
      id: 3,
      name: "Wingztab",
      image: require("@/assets/images/food/wings.jpg"),
      color: "#FFCC00",
    },
    {
      id: 4,
      name: "Ramen",
      image: require("@/assets/images/food/ramen.jpg"),
      color: "#FFA500",
    },
    {
      id: 5,
      name: "Tiramisu",
      image: require("@/assets/images/food/tiramisu.jpg"),
      color: "#FFCC00",
    },
    {
      id: 6,
      name: "Beef wellington",
      image: require("@/assets/images/food/beef.jpg"),
      color: "#FFA500",
    },
    {
      id: 7,
      name: "Tiramisu",
      image: require("@/assets/images/food/tiramisu.jpg"),
      color: "#FFCC00",
    },
    {
      id: 8,
      name: "Beef wellington",
      image: require("@/assets/images/food/beef.jpg"),
      color: "#FFA500",
    },
  ];

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
          <Text className="text-xl font-bold mb-3">Mr. Chef</Text>
          <TouchableOpacity className="bg-red-600 py-2 px-10 rounded-lg">
            <Text className="text-white font-bold">Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View className="flex-row justify-around py-3">
          {["Repost", "Likes", "Bookmark"].map((tab) => (
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

        {/* Food Grid */}
        <View className="flex-row flex-wrap p-2">
          {foodItems.map((item, index) => (
            <View key={`${item.id}-${index}`} className="w-1/2 p-2 relative">
              <Image
                source={item.image}
                className="w-full h-[120px] rounded-lg"
                resizeMode="cover"
              />
              <View
                className="absolute bottom-4 left-4 py-1 px-2 rounded bg-opacity-90"
                style={{ backgroundColor: item.color }}
              >
                <Text className="text-[#333] font-bold text-xs">
                  {item.name}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
