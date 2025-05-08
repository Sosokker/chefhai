import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';

export default function RecipeDetailScreen() {
  const { title, image } = useLocalSearchParams();
  
  const recipeTitle = title || "Pad Kra Pao Moo Sab with Eggs";
  const recipeImage = typeof image === 'string' ? image : "/placeholder.svg?height=400&width=400&query=thai basil stir fry with egg and rice";
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header with back and share buttons */}
        <View className="flex-row justify-between items-center px-4 pt-4 absolute z-10 w-full">
          <TouchableOpacity 
            className="bg-[#ffd60a] p-3 rounded-lg"
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={24} color="#bb0718" />
          </TouchableOpacity>
          
          <TouchableOpacity className="bg-white p-3 rounded-lg">
            <Feather name="send" size={24} color="#ffd60a" />
          </TouchableOpacity>
        </View>
        
        {/* Recipe Image */}
        <View className="items-center justify-center pt-16 pb-6">
          <Image 
            source={{ uri: recipeImage }}
            className="w-72 h-72 rounded-full"
          />
        </View>
        
        {/* Recipe Title and Description */}
        <View className="px-6">
          <Text className="text-4xl font-bold">{recipeTitle}</Text>
          <Text className="text-gray-600 mt-2 text-lg">
            Pad kra pao, also written as pad gaprao, is a popular Thai stir fry of ground meat and holy basil.
          </Text>
          
          {/* Recipe Info */}
          <View className="flex-row justify-between mt-8">
            <View>
              <Text className="text-2xl font-bold">Skills</Text>
              <Text className="text-gray-600 mt-1">Easy</Text>
            </View>
            
            <View>
              <Text className="text-2xl font-bold">Time</Text>
              <Text className="text-gray-600 mt-1">30 Mins</Text>
            </View>
            
            <View>
              <Text className="text-2xl font-bold">Ingredients</Text>
              <Text className="text-gray-600 mt-1">10+</Text>
            </View>
            
            <View>
              <Text className="text-2xl font-bold">Calories</Text>
              <Text className="text-gray-600 mt-1">300 kCal</Text>
            </View>
          </View>
          
          {/* Ingredients */}
          <Text className="text-3xl font-bold mt-12">Ingredients</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            className="mt-6 mb-4"
            contentContainerStyle={{ paddingLeft: 4, paddingRight: 20 }}
          >
            <View className="flex-row space-x-6">
              <View className="w-24 h-24 bg-gray-300 rounded-lg" />
              <View className="w-24 h-24 bg-gray-300 rounded-lg" />
              <View className="w-24 h-24 bg-gray-300 rounded-lg" />
              <View className="w-24 h-24 bg-gray-300 rounded-lg" />
              <View className="w-24 h-24 bg-gray-300 rounded-lg" />
            </View>
          </ScrollView>
          
          {/* Nutrition Info */}
          <View className="bg-[#ffd60a] rounded-lg p-6 mt-10">
            <View className="flex-row justify-between">
              <View className="items-center">
                <View className="w-16 h-16 rounded-full border-4 border-[#397e36] items-center justify-center">
                  <Text className="text-xl font-bold">0</Text>
                  <Text className="text-xs">/32g</Text>
                </View>
                <Text className="mt-2 font-semibold">Fat</Text>
              </View>
              
              <View className="items-center">
                <View className="w-16 h-16 rounded-full border-4 border-[#397e36] items-center justify-center">
                  <Text className="text-xl font-bold">0</Text>
                  <Text className="text-xs">/32g</Text>
                </View>
                <Text className="mt-2 font-semibold">Fiber</Text>
              </View>
              
              <View className="items-center">
                <View className="w-16 h-16 rounded-full border-4 border-[#a07d1a] items-center justify-center">
                  <Text className="text-xl font-bold">0</Text>
                  <Text className="text-xs">/32g</Text>
                </View>
                <Text className="mt-2 font-semibold">Protein</Text>
              </View>
              
              <View className="items-center">
                <View className="w-16 h-16 rounded-full border-4 border-[#c87a20] items-center justify-center">
                  <Text className="text-xl font-bold">0</Text>
                  <Text className="text-xs">/32g</Text>
                </View>
                <Text className="mt-2 font-semibold">Carbs</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Bottom Spacing */}
        <View className="h-28" />
      </ScrollView>
      
      {/* Cook Button */}
    <View className="absolute bottom-0 left-0 right-0">
      <View className="bg-[#bb0718] py-4 items-center">
        <View className="flex-row items-center">
        <Text className="text-[#ffd60a] text-2xl font-bold mr-2">Let's Cook!</Text>
        <FontAwesome5 name="utensils" size={24} color="#ffd60a" />
        </View>
      </View>
      <View className="bg-[#ffd60a] h-16" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 50, borderBottomRightRadius: 50 }} />
    </View>
    </SafeAreaView>
  );
}