import { Image } from "expo-image";
import { router } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/IconSymbol";

export default function HomeScreen() {
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

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hi! Mr. Chef</Text>
          <TouchableOpacity style={styles.scanButton}>
            <IconSymbol name="qrcode.viewfinder" size={24} color="#333333" />
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <View style={styles.heroContent}>
            <Image
              source={require("@/assets/images/notebook-orange.png")}
              style={styles.heroImage}
              contentFit="contain"
            />
          </View>
        </View>

        {/* Food Highlights Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Food Highlights</Text>
            <IconSymbol name="star.fill" size={16} color="#FFCC00" />
          </View>

          <View style={styles.foodHighlightsContainer}>
            {foodHighlights.map((food) => (
              <TouchableOpacity
                key={food.id}
                style={styles.foodCard}
                onPress={() => navigateToFoodDetail(String(food.id))}
              >
                <Image
                  source={food.image}
                  style={styles.foodImage}
                  contentFit="cover"
                />
                <View style={styles.foodCardContent}>
                  <Text style={styles.foodCardTitle} numberOfLines={1}>
                    {food.name}
                  </Text>
                  <Text style={styles.foodCardDescription} numberOfLines={1}>
                    {food.description}
                  </Text>
                  <View style={styles.foodCardMeta}>
                    <View style={styles.foodCardMetaItem}>
                      <IconSymbol name="clock" size={12} color="#666666" />
                      <Text style={styles.foodCardMetaText}>{food.time}</Text>
                    </View>
                    <View style={styles.foodCardMetaItem}>
                      <IconSymbol name="flame" size={12} color="#666666" />
                      <Text style={styles.foodCardMetaText}>
                        {food.calories}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Show your dishes Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Show your dishes</Text>
            <IconSymbol name="chevron.down" size={16} color="#333333" />
          </View>

          <View style={styles.searchContainer}>
            <TextInput style={styles.searchInput} placeholder="Search..." />
            <TouchableOpacity style={styles.searchButton}>
              <IconSymbol name="arrow.right" size={16} color="#333333" />
            </TouchableOpacity>
          </View>

          <View style={styles.uploadOptions}>
            <TouchableOpacity style={styles.uploadOption}>
              <IconSymbol name="camera.fill" size={24} color="#333333" />
              <Text style={styles.uploadOptionTitle}>From Camera</Text>
              <Text style={styles.uploadOptionSubtitle}>
                Snap it from Camera
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.uploadOption, styles.orangeOption]}
            >
              <IconSymbol name="photo.fill" size={24} color="#333333" />
              <Text style={styles.uploadOptionTitle}>From Gallery</Text>
              <Text style={styles.uploadOptionSubtitle}>
                Select from Gallery
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  greeting: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
  },
  scanButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFCC00",
    justifyContent: "center",
    alignItems: "center",
  },
  heroContainer: {
    height: 180,
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 16,
    backgroundColor: "#FFF3D9", // Light yellow/orange gradient
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  heroContent: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  heroImage: {
    width: 120,
    height: 120,
  },
  sectionContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginRight: 8,
  },
  foodHighlightsContainer: {
    width: "100%",
  },
  foodCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  foodImage: {
    width: 100,
    height: 100,
  },
  foodCardContent: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  foodCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 4,
  },
  foodCardDescription: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 8,
  },
  foodCardMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  foodCardMetaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  foodCardMetaText: {
    fontSize: 12,
    color: "#666666",
    marginLeft: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 24,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    height: "100%",
  },
  searchButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFCC00",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  uploadOption: {
    flex: 1,
    height: 100,
    backgroundColor: "#FFCC00",
    borderRadius: 12,
    marginRight: 8,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  orangeOption: {
    backgroundColor: "#FFA500", // Darker orange
    marginRight: 0,
  },
  uploadOptionTitle: {
    fontWeight: "bold",
    color: "#333333",
    marginTop: 8,
  },
  uploadOptionSubtitle: {
    fontSize: 12,
    color: "#333333",
    opacity: 0.8,
  },
});
