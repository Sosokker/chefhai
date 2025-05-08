import React, { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Alert } from 'react-native';
import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

// Sample recipe data
const recipeData = [
  {
    id: 1,
    title: "Pad Kra Pao Moo Sab with Eggs",
    image: "/placeholder.svg?height=400&width=400&query=thai basil stir fry with egg and rice",
    color: "#ffd60a"
  },
  {
    id: 2,
    title: "Chicken Curry",
    image: "/placeholder.svg?height=400&width=400&query=chicken curry with rice",
    color: "#ffd60a"
  },
  {
    id: 3,
    title: "Beef Steak",
    image: "/placeholder.svg?height=400&width=400&query=beef steak with vegetables",
    color: "#bb0718"
  },
  {
    id: 4,
    title: "Vegetable Pasta",
    image: "/placeholder.svg?height=400&width=400&query=vegetable pasta",
    color: "#ffd60a"
  },
  {
    id: 5,
    title: "Salmon Sushi",
    image: "/placeholder.svg?height=400&width=400&query=salmon sushi",
    color: "#ffd60a"
  }
];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRecipes, setFilteredRecipes] = useState(recipeData);
  
  // Handle search
  const handleSearch = (text: string): void => {
    setSearchQuery(text);
    if (text) {
      const filtered = recipeData.filter((recipe: Recipe) => 
        recipe.title.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredRecipes(filtered);
    } else {
      setFilteredRecipes(recipeData);
    }
  };
  
  // Handle camera
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions to use this feature.');
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
        pathname: '/recipe-detail',
        params: { 
          title: 'My New Recipe',
          image: result.assets[0].uri
        }
      });
    }
  };
  
  // Handle gallery
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant media library permissions to use this feature.');
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
        pathname: '/recipe-detail',
        params: { 
          title: 'My New Recipe',
          image: result.assets[0].uri
        }
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
      pathname: '/recipe-detail',
      params: { 
        title: recipe.title,
        image: recipe.image
      }
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
        {/* Center Image */}
        <View className="items-center justify-center my-8">
          <View className="w-32 h-32 items-center justify-center bg-[#fff5e6] rounded-full">
            <View className="flex-row items-center">
              <View className="absolute flex-row">
                <Image 
                  source={{ uri: "/placeholder.svg?height=60&width=60&query=orange fruit with green leaf" }}
                  className="w-14 h-14"
                />
              </View>
            </View>
          </View>
        </View>
        
        {/* Highlights Section */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center mb-4">
            <Text className="text-2xl font-bold mr-2">Highlights</Text>
            <FontAwesome name="star" size={20} color="#ffd60a" />
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            <View className="flex-row">
              {filteredRecipes.slice(0, 3).map((recipe) => (
                <TouchableOpacity 
                  key={recipe.id}
                  className={`w-36 h-40 bg-[${recipe.color}] rounded-xl mr-3 overflow-hidden`}
                  onPress={() => goToRecipeDetail(recipe)}
                >
                  <Image 
                    source={{ uri: recipe.image }}
                    className="w-full h-full opacity-70"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          
          <View className="flex-row">
            {filteredRecipes.slice(3, 5).map((recipe) => (
              <TouchableOpacity 
                key={recipe.id}
                className={`w-36 h-40 bg-[${recipe.color}] rounded-xl mr-3 overflow-hidden`}
                onPress={() => goToRecipeDetail(recipe)}
              >
                <Image 
                  source={{ uri: recipe.image }}
                  className="w-full h-full opacity-70"
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
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
                <Text className="text-sm text-gray-700">Straight from Camera</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="bg-[#f9be25] p-4 rounded-xl w-[48%]"
              onPress={pickImage}
            >
              <View className="items-center">
                <Feather name="image" size={24} color="black" />
                <Text className="text-lg font-bold mt-2">From Gallery</Text>
                <Text className="text-sm text-gray-700">Straight from Gallery</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Extra space at bottom */}
        <View className="h-20"></View>
      </ScrollView>
    </SafeAreaView>
  );
}