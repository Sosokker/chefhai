import { IconSymbol } from "@/components/ui/IconSymbol";
import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
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
} from "react-native";

// Sample recipe data
const foodHighlights = [
  {
    id: 1,
    name: "Pad Kra Pao Moo Sab with Eggs",
    image: require("@/assets/images/food/padkrapao.jpg"),
    description: "Thai stir-fry with ground pork and holy basil",
    time: "30 Mins",
    calories: "520 kcal",
  },
  {
    id: 2,
    name: "Jjajangmyeon",
    image: require("@/assets/images/food/jjajangmyeon.jpg"),
    description: "Korean black bean noodles",
    time: "45 Mins",
    calories: "650 kcal",
  },
  {
    id: 3,
    name: "Ramen",
    image: require("@/assets/images/food/ramen.jpg"),
    description: "Japanese noodle soup",
    time: "60 Mins",
    calories: "480 kcal",
  },
  {
    id: 4,
    name: "Beef Wellington",
    image: require("@/assets/images/food/beef.jpg"),
    description: "Tender beef wrapped in puff pastry",
    time: "90 Mins",
    calories: "750 kcal",
  },
];

const navigateToFoodDetail = (foodId: string) => {
  router.push({ pathname: "/food/[id]", params: { id: foodId } });
};

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredRecipes, setFilteredRecipes] = useState(foodHighlights);

  // Handle search
  const handleSearch = (text: string): void => {
    setSearchQuery(text);
    if (text) {
      const filtered = foodHighlights.filter((food) =>
        food.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredRecipes(filtered);
    } else {
      setFilteredRecipes(foodHighlights);
    }
  };

  // Handle camera
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant camera permissions to use this feature."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      // Navigate to recipe detail with the captured image
      router.push({
        pathname: "/recipe-detail",
        params: {
          title: "My New Recipe",
          image: result.assets[0].uri,
        },
      });
    }
  };

  // Handle gallery
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant media library permissions to use this feature."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      // Navigate to recipe detail with the selected image
      router.push({
        pathname: "/recipe-detail",
        params: {
          title: "My New Recipe",
          image: result.assets[0].uri,
        },
      });
    }
  };

  // Navigate to recipe detail
  interface Recipe {
    id: number;
    title: string;
    image: string;
    color: string;
  }

  const goToRecipeDetail = (recipe: Recipe): void => {
    router.push({
      pathname: "/recipe-detail",
      params: {
        title: recipe.title,
        image: recipe.image,
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header - Fixed at top */}
      <View className="flex-row justify-between items-center px-6 pt-4 pb-2">
        <Text className="text-3xl font-bold">Hi! Mr. Chef</Text>
        <View className="bg-[#ffd60a] p-3 rounded-lg">
          <Ionicons name="settings-outline" size={24} color="black" />
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Show your dishes */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center mb-4">
            <Text className="text-2xl font-bold mr-2">Show your dishes</Text>
            <Feather name="wifi" size={20} color="black" />
          </View>

          <View className="bg-white border border-gray-300 rounded-full mb-6 flex-row items-center px-4 py-3">
            <TextInput
              className="flex-1"
              placeholder="Search..."
              value={searchQuery}
              onChangeText={handleSearch}
            />
            <View className="bg-[#ffd60a] p-2 rounded-full">
              <Feather name="send" size={20} color="black" />
            </View>
          </View>

          <View className="flex-row justify-between">
            <TouchableOpacity
              className="bg-[#ffd60a] p-4 rounded-xl w-[48%]"
              onPress={takePhoto}
            >
              <View className="items-center">
                <FontAwesome name="camera" size={24} color="black" />
                <Text className="text-lg font-bold mt-2">From Camera</Text>
                <Text className="text-sm text-gray-700">
                  Straight from Camera
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-[#f9be25] p-4 rounded-xl w-[48%]"
              onPress={pickImage}
            >
              <View className="items-center">
                <Feather name="image" size={24} color="black" />
                <Text className="text-lg font-bold mt-2">From Gallery</Text>
                <Text className="text-sm text-gray-700">
                  Straight from Gallery
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Food Highlights Section */}
        <View className="mx-4 mb-6">
          <View className="flex-row items-center mb-3">
            <Text className="text-lg font-bold text-[#333] mr-2">
              Food Highlights
            </Text>
            <IconSymbol name="star.fill" size={16} color="#FFCC00" />
          </View>
          <View className="w-full">
            {foodHighlights.map((food) => (
              <TouchableOpacity
                key={food.id}
                className="flex-row bg-white rounded-xl mb-3 shadow-sm overflow-hidden"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
                onPress={() => navigateToFoodDetail(String(food.id))}
              >
                <Image
                  source={food.image}
                  className="w-[88px] h-[88px] rounded-l-xl"
                  resizeMode="cover"
                />
                <View className="flex-1 p-3 justify-between">
                  <Text
                    className="text-base font-bold text-[#333] mb-1"
                    numberOfLines={1}
                  >
                    {food.name}
                  </Text>
                  <Text className="text-sm text-[#666] mb-2" numberOfLines={1}>
                    {food.description}
                  </Text>
                  <View className="flex-row justify-between">
                    <View className="flex-row items-center">
                      <IconSymbol name="clock" size={12} color="#666666" />
                      <Text className="text-xs text-[#666] ml-1">
                        {food.time}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <IconSymbol name="flame" size={12} color="#666666" />
                      <Text className="text-xs text-[#666] ml-1">
                        {food.calories}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Extra space at bottom */}
        <View className="h-20"></View>
      </ScrollView>
    </SafeAreaView>
  );
}
