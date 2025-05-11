"use client";

import { IconSymbol } from "@/components/ui/IconSymbol";
import { supabase } from "@/services/supabase";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import "nativewind";
import { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Step {
  id: string;
  food_id: string;
  title: string;
  step_order: number;
  description: string;
  created_at: string;
}

export default function CookingSessionScreen() {
  const { id: foodId } = useLocalSearchParams();
  const [currentStep, setCurrentStep] = useState(0);

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
    enabled: !!foodId,
  });

  if (stepsLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-1 justify-center items-center">
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (stepsError) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-1 justify-center items-center">
          <Text>Error loading steps</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalSteps = steps?.length || 0;

  const goToNextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const stopCookingSession = () => {
    Alert.alert(
      "Stop Cooking?",
      "Are you sure you want to stop this cooking session?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes, stop", onPress: () => router.back() },
      ]
    );
  };
  if (!steps || steps.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-1 items-center justify-center">
          <Text>No steps found</Text>
          <TouchableOpacity
            className="px-4 py-2 bg-yellow-400 rounded-full mt-4"
            onPress={() => router.back()}
          >
            <Text className="text-lg font-bold text-white">
              Go back to home page
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView className="flex-1">
        {/* Header with back button */}
        <View className="px-4 py-3">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-yellow-300 justify-center items-center"
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={24} color="#333333" />
          </TouchableOpacity>
        </View>

        {/* Step Illustration */}
        <View className="items-center my-5">
          {/* If your steps have an image property, render it. Otherwise, skip the image or add a placeholder. */}
          {/* <Image source={{ uri: steps[currentStep].image }} className="w-48 h-48 rounded-full bg-yellow-300" contentFit="contain" /> */}
        </View>

        {/* Step Information */}
        <View className="px-6 mb-6 items-center">
          <Text className="text-lg text-lime-600 font-bold mb-2">
            Step {currentStep + 1} of {totalSteps}
          </Text>
          <Text className="text-2xl font-bold text-gray-800 text-center mb-3">
            {steps && steps[currentStep]?.title}
          </Text>
          <Text className="text-base text-gray-600 text-center leading-6">
            {steps && steps[currentStep]?.description}
          </Text>
        </View>

        {/* Step Indicators */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-bold text-gray-800 mb-3">Steps</Text>
          <View className="flex-row justify-center">
            {steps &&
              steps.map((_: any, index: any) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setCurrentStep(index)}
                >
                  <View
                    className={`w-10 h-10 rounded-full mx-2 ${
                      currentStep === index ? "bg-yellow-300" : "bg-gray-200"
                    }`}
                  />
                </TouchableOpacity>
              ))}
          </View>
        </View>

        {/* Navigation Buttons */}
        <View className="px-6 mb-20">
          <View className="flex-row justify-between">
            {currentStep > 0 && (
              <TouchableOpacity
                className="flex-1 flex-row items-center justify-center py-4 rounded-lg bg-white border border-gray-300 mr-2"
                onPress={goToPreviousStep}
              >
                <IconSymbol name="chevron.left" size={20} color="#333333" />
                <Text className="text-base font-bold text-gray-800 ml-2">
                  Previous
                </Text>
              </TouchableOpacity>
            )}

            {currentStep < totalSteps - 1 ? (
              <TouchableOpacity
                className="flex-1 flex-row items-center justify-center py-4 rounded-lg bg-yellow-300 ml-2"
                onPress={goToNextStep}
              >
                <Text className="text-base font-bold text-gray-800 mr-2">
                  Next Step
                </Text>
                <IconSymbol name="chevron.right" size={20} color="#333333" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                className="flex-1 flex-row items-center justify-center py-4 rounded-lg bg-green-600 ml-2"
                onPress={() => router.back()}
              >
                <Text className="text-base font-bold text-white mr-2">
                  Finish
                </Text>
                <IconSymbol name="checkmark" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Stop Session Button */}
      <TouchableOpacity
        className="absolute bottom-0 left-0 right-0 bg-red-800 flex-row justify-center items-center py-4"
        onPress={stopCookingSession}
      >
        <Text className="text-lg font-bold text-yellow-300 mr-2">
          Stop Session
        </Text>
        <IconSymbol name="fork.knife" size={20} color="#FFCC00" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
