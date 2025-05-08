"use client";

import { IconSymbol } from "@/components/ui/IconSymbol";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FoodDetailScreen() {
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState("Ingredients");

  // Mock data - in a real app, you would fetch this based on the ID
  const foodData = {
    id: 1,
    name: "Pad Kra Pao Moo Sab with Eggs",
    image: require("@/assets/images/food/padkrapao.jpg"),
    description:
      "Pad kra pao, also written as pad gaprao, is a popular Thai stir-fry of ground meat and holy basil.",
    time: "30 Mins",
    skills: "Easy",
    ingredients: [
      { name: "Ground pork", emoji: "🥩" },
      { name: "Holy basil", emoji: "🌿" },
      { name: "Garlic", emoji: "🧄" },
      { name: "Thai chili", emoji: "🌶️" },
      { name: "Soy sauce", emoji: "🍶" },
      { name: "Oyster sauce", emoji: "🦪" },
      { name: "Sugar", emoji: "🧂" },
      { name: "Eggs", emoji: "🥚" },
    ],
    calories: "520 kcal",
    nutrition: {
      fat: 15,
      fiber: 3,
      protein: 25,
      carbs: 40,
    },
    steps: [
      "Gather and prepare all ingredients",
      "Heat oil in a wok or large frying pan",
      "Fry the eggs sunny side up and set aside",
      "Stir-fry garlic and chilies until fragrant",
      "Add ground pork and cook until browned",
      "Add sauces and basil, serve with rice and egg on top",
    ],
  };

  const startCookingSession = () => {
    router.push(`/cooking/[id]`);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scrollView}>
        {/* Header with back and share buttons */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={24} color="#333333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton}>
            <IconSymbol name="square.and.arrow.up" size={24} color="#FFCC00" />
          </TouchableOpacity>
        </View>

        {/* Food Image */}
        <View style={styles.imageContainer}>
          <Image
            source={foodData.image}
            style={styles.foodImage}
            contentFit="cover"
          />
        </View>

        {/* Food Title and Description */}
        <View style={styles.contentContainer}>
          <Text style={styles.foodTitle}>{foodData.name}</Text>
          <Text style={styles.foodDescription}>{foodData.description}</Text>

          {/* Info Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setActiveTab("Skills")}
            >
              <Text style={styles.tabLabel}>Skills</Text>
              <Text style={styles.tabValue}>{foodData.skills}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setActiveTab("Time")}
            >
              <Text style={styles.tabLabel}>Time</Text>
              <Text style={styles.tabValue}>{foodData.time}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabItem,
                activeTab === "Ingredients" && styles.activeTabItem,
              ]}
              onPress={() => setActiveTab("Ingredients")}
            >
              <Text style={styles.tabLabel}>Ingredients</Text>
              <Text style={styles.tabValue}>{foodData.ingredients.length}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setActiveTab("Calories")}
            >
              <Text style={styles.tabLabel}>Calories</Text>
              <Text style={styles.tabValue}>{foodData.calories}</Text>
            </TouchableOpacity>
          </View>

          {/* Ingredients Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            <View style={styles.ingredientsGrid}>
              {foodData.ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientItem}>
                  <View style={styles.ingredientIconContainer}>
                    <Text style={styles.ingredientEmoji}>
                      {ingredient.emoji}
                    </Text>
                  </View>
                  <Text style={styles.ingredientName}>{ingredient.name}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Nutrition Section - Improved UI */}
          <View style={styles.nutritionSection}>
            <Text style={styles.sectionTitle}>Nutrition Facts</Text>
            <View style={styles.nutritionContainer}>
              <View style={styles.nutritionItem}>
                <View
                  style={[
                    styles.nutritionCircle,
                    { backgroundColor: "#FFD700" },
                  ]}
                >
                  <Text style={styles.nutritionValue}>
                    {foodData.nutrition.fat}
                  </Text>
                  <Text style={styles.nutritionUnit}>g</Text>
                </View>
                <Text style={styles.nutritionLabel}>Fat</Text>
              </View>
              <View style={styles.nutritionItem}>
                <View
                  style={[
                    styles.nutritionCircle,
                    { backgroundColor: "#90EE90" },
                  ]}
                >
                  <Text style={styles.nutritionValue}>
                    {foodData.nutrition.fiber}
                  </Text>
                  <Text style={styles.nutritionUnit}>g</Text>
                </View>
                <Text style={styles.nutritionLabel}>Fiber</Text>
              </View>
              <View style={styles.nutritionItem}>
                <View
                  style={[
                    styles.nutritionCircle,
                    { backgroundColor: "#ADD8E6" },
                  ]}
                >
                  <Text style={styles.nutritionValue}>
                    {foodData.nutrition.protein}
                  </Text>
                  <Text style={styles.nutritionUnit}>g</Text>
                </View>
                <Text style={styles.nutritionLabel}>Protein</Text>
              </View>
              <View style={styles.nutritionItem}>
                <View
                  style={[
                    styles.nutritionCircle,
                    { backgroundColor: "#FFA07A" },
                  ]}
                >
                  <Text style={styles.nutritionValue}>
                    {foodData.nutrition.carbs}
                  </Text>
                  <Text style={styles.nutritionUnit}>g</Text>
                </View>
                <Text style={styles.nutritionLabel}>Carbs</Text>
              </View>
            </View>
          </View>

          {/* Steps Preview */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Cooking Steps</Text>
            <View style={styles.stepsPreviewContainer}>
              {foodData.steps.slice(0, 2).map((step, index) => (
                <View key={index} style={styles.stepPreviewItem}>
                  <View style={styles.stepNumberCircle}>
                    <Text style={styles.stepNumber}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepPreviewText}>{step}</Text>
                </View>
              ))}
              <Text style={styles.moreStepsText}>
                ...and {foodData.steps.length - 2} more steps
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Cook Button */}
      <TouchableOpacity style={styles.cookButton} onPress={startCookingSession}>
        <Text style={styles.cookButtonText}>Let&apos;s Cook!</Text>
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
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFCC00",
    justifyContent: "center",
    alignItems: "center",
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 20,
  },
  foodImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 5,
    borderColor: "#FFFFFF",
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  foodTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
  },
  foodDescription: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 20,
    lineHeight: 22,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  tabItem: {
    alignItems: "center",
  },
  activeTabItem: {
    borderBottomWidth: 2,
    borderBottomColor: "#333333",
  },
  tabLabel: {
    fontSize: 14,
    color: "#666666",
  },
  tabValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    marginTop: 4,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 16,
  },
  ingredientsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  ingredientItem: {
    width: "25%",
    alignItems: "center",
    marginBottom: 16,
  },
  ingredientIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F8F8F8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ingredientEmoji: {
    fontSize: 30,
  },
  ingredientName: {
    fontSize: 12,
    textAlign: "center",
    color: "#333333",
  },
  nutritionSection: {
    marginBottom: 20,
  },
  nutritionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  nutritionItem: {
    alignItems: "center",
  },
  nutritionCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  nutritionUnit: {
    fontSize: 12,
    color: "#333333",
    position: "absolute",
    bottom: 10,
    right: 10,
  },
  nutritionLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
  },
  stepsPreviewContainer: {
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 16,
  },
  stepPreviewItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  stepNumberCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFCC00",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  stepPreviewText: {
    fontSize: 16,
    color: "#333333",
    flex: 1,
  },
  moreStepsText: {
    fontSize: 14,
    color: "#666666",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 8,
  },
  cookButton: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FF0000",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
  },
  cookButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFCC00",
    marginRight: 8,
  },
});
