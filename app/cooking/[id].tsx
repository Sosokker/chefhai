"use client";

import { IconSymbol } from "@/components/ui/IconSymbol";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CookingSessionScreen() {
  const { id } = useLocalSearchParams();
  const [currentStep, setCurrentStep] = useState(0);

  // Mock data - in a real app, you would fetch this based on the ID
  const recipeData = {
    id: 1,
    name: "Pad Kra Pao Moo Sab with Eggs",
    steps: [
      {
        title: "Gather and prepare all ingredients",
        description:
          "Chop garlic, Thai chilies, and protein of choice (chicken, pork, beef, or tofu)",
        image: require("@/assets/images/cooking/step1.png"),
      },
      {
        title: "Heat oil in a wok or large frying pan",
        description:
          "Use medium-high heat. The oil should be hot but not smoking.",
        image: require("@/assets/images/cooking/step2.png"),
      },
      {
        title: "Fry the eggs sunny side up",
        description:
          "Heat oil in a separate pan and fry eggs until whites are set but yolks are still runny. Set aside.",
        image: require("@/assets/images/cooking/step3.png"),
      },
      {
        title: "Stir-fry garlic and chilies",
        description:
          "Add chopped garlic and chilies to the hot oil and stir-fry until fragrant, about 30 seconds.",
        image: require("@/assets/images/cooking/step4.png"),
      },
      {
        title: "Add ground pork and cook until browned",
        description:
          "Break up the meat with a spatula and cook until no longer pink, about 3-4 minutes.",
        image: require("@/assets/images/cooking/step5.png"),
      },
      {
        title: "Add sauces and basil",
        description:
          "Add soy sauce, oyster sauce, sugar, and holy basil. Stir well and cook for another minute. Serve with rice and top with the fried egg.",
        image: require("@/assets/images/cooking/step6.png"),
      },
    ],
  };

  const totalSteps = recipeData.steps.length;

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

  const getHelpWithStep = () => {
    Alert.alert(
      "Need Help?",
      `Tips for ${recipeData.steps[currentStep].title}:\n\n` +
        "• Make sure ingredients are properly prepared\n" +
        "• Watch your heat level\n" +
        "• Don't overcook the ingredients\n\n" +
        "Would you like to see a video tutorial?",
      [
        { text: "No, thanks", style: "cancel" },
        {
          text: "Yes, show video",
          onPress: () => console.log("Show video tutorial"),
        },
      ]
    );
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

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scrollView}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={24} color="#333333" />
          </TouchableOpacity>
        </View>

        {/* Step Illustration */}
        <View style={styles.illustrationContainer}>
          <Image
            source={recipeData.steps[currentStep].image}
            style={styles.stepImage}
            contentFit="contain"
          />
        </View>

        {/* Step Information */}
        <View style={styles.stepInfoContainer}>
          <Text style={styles.stepCounter}>
            Step {currentStep + 1} of {totalSteps}
          </Text>
          <Text style={styles.stepTitle}>
            {recipeData.steps[currentStep].title}
          </Text>
          <Text style={styles.stepDescription}>
            {recipeData.steps[currentStep].description}
          </Text>
        </View>

        {/* Step Indicators */}
        <View style={styles.stepIndicatorsContainer}>
          <Text style={styles.stepsLabel}>Steps</Text>
          <View style={styles.stepDots}>
            {recipeData.steps.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setCurrentStep(index)}
              >
                <View
                  style={[
                    styles.stepDot,
                    currentStep === index && styles.activeStepDot,
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity style={styles.helpButton} onPress={getHelpWithStep}>
            <Text style={styles.helpButtonText}>Help me!</Text>
          </TouchableOpacity>

          <View style={styles.stepNavigation}>
            {currentStep > 0 && (
              <TouchableOpacity
                style={[styles.navButton, styles.prevButton]}
                onPress={goToPreviousStep}
              >
                <IconSymbol name="chevron.left" size={20} color="#333333" />
                <Text style={styles.prevButtonText}>Previous</Text>
              </TouchableOpacity>
            )}

            {currentStep < totalSteps - 1 ? (
              <TouchableOpacity
                style={[styles.navButton, styles.nextButton]}
                onPress={goToNextStep}
              >
                <Text style={styles.nextButtonText}>Next Step</Text>
                <IconSymbol name="chevron.right" size={20} color="#333333" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.navButton, styles.finishButton]}
                onPress={() => router.back()}
              >
                <Text style={styles.finishButtonText}>Finish</Text>
                <IconSymbol name="checkmark" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Stop Session Button */}
      <TouchableOpacity style={styles.stopButton} onPress={stopCookingSession}>
        <Text style={styles.stopButtonText}>Stop Session</Text>
        <IconSymbol name="fork.knife" size={20} color="#FFCC00" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFCC00",
    justifyContent: "center",
    alignItems: "center",
  },
  illustrationContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  stepImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#FFCC00",
  },
  stepInfoContainer: {
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 30,
  },
  stepCounter: {
    fontSize: 18,
    color: "#8BC34A",
    fontWeight: "bold",
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    textAlign: "center",
    marginBottom: 12,
  },
  stepDescription: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    lineHeight: 24,
  },
  stepIndicatorsContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  stepsLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 12,
  },
  stepDots: {
    flexDirection: "row",
    justifyContent: "center",
  },
  stepDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEEEEE",
    marginHorizontal: 8,
  },
  activeStepDot: {
    backgroundColor: "#FFCC00",
  },
  navigationContainer: {
    paddingHorizontal: 24,
    marginBottom: 80,
  },
  helpButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  helpButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  stepNavigation: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  navButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 8,
  },
  prevButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    marginRight: 8,
  },
  prevButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    marginLeft: 8,
  },
  nextButton: {
    backgroundColor: "#FFCC00",
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    marginRight: 8,
  },
  finishButton: {
    backgroundColor: "#4CAF50",
  },
  finishButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginRight: 8,
  },
  stopButton: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#C62828",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
  },
  stopButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFCC00",
    marginRight: 8,
  },
});
