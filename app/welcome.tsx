import React from 'react';
import { View, Text, Image, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function WelcomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      
      <View className="flex-1 justify-between px-6 py-10">
        {/* Logo and Welcome Text */}
        <View className="items-center mt-10">
          <View className="w-32 h-32 items-center justify-center bg-[#ffd60a] rounded-full mb-8">
            <Feather name="book-open" size={60} color="#bb0718" />
          </View>
          
          <Text className="text-4xl font-bold text-center">Welcome to ChefHai</Text>
          <Text className="text-gray-600 text-center mt-4 text-lg">
            Discover, cook and share delicious recipes with food lovers around the world
          </Text>
        </View>
        
        {/* Food Image */}
        <View className="items-center my-8">
          <Image 
            source={{ uri: "/placeholder.svg?height=300&width=300&query=colorful food dishes arrangement" }}
            className="w-72 h-72 rounded-full"
          />
        </View>
        
        {/* Buttons */}
        <View className="space-y-4 mb-6">
          <TouchableOpacity 
            className="bg-[#ffd60a] py-4 rounded-xl mb-4"
            onPress={() => router.push('/login')}
          >
            <Text className="text-center font-bold text-lg">Login</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="bg-white border border-[#ffd60a] py-4 rounded-xl"
            onPress={() => router.push('/signup')}
          >
            <Text className="text-center font-bold text-lg text-[#bb0718]">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}