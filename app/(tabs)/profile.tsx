"use client";

import { Image } from "expo-image";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scrollView}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarPlaceholder}>👨‍🍳</Text>
            </View>
          </View>
          <Text style={styles.username}>Mr. Chef</Text>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {["Repost", "Likes", "Bookmark"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={styles.tabText}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.divider} />

        {/* Food Grid */}
        <View style={styles.foodGrid}>
          {foodItems.map((item, index) => (
            <View key={`${item.id}-${index}`} style={styles.foodItem}>
              <Image
                source={item.image}
                style={styles.foodImage}
                contentFit="cover"
              />
              <View style={[styles.foodLabel, { backgroundColor: item.color }]}>
                <Text style={styles.foodLabelText}>{item.name}</Text>
              </View>
            </View>
          ))}
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
  profileHeader: {
    alignItems: "center",
    paddingVertical: 24,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarPlaceholder: {
    fontSize: 40,
  },
  username: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  editButton: {
    backgroundColor: "#FF0000",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#333333",
  },
  tabText: {
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginHorizontal: 16,
  },
  foodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 8,
  },
  foodItem: {
    width: "50%",
    padding: 8,
    position: "relative",
  },
  foodImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
  },
  foodLabel: {
    position: "absolute",
    bottom: 16,
    left: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  foodLabelText: {
    color: "#333333",
    fontWeight: "bold",
    fontSize: 12,
  },
});
