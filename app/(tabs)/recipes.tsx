import { IconSymbol } from "@/components/ui/IconSymbol";
import { Image } from "expo-image";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RecipesScreen() {
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
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scrollView}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <IconSymbol name="magnifyingglass" size={20} color="#FF0000" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#FF0000"
          />
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <TouchableOpacity style={styles.yellowButton}>
            <Text style={styles.buttonText}>All Recipes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.redButton}>
            <Text style={styles.redButtonText}>My Recipes</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Food Grid */}
        <View style={styles.foodGrid}>
          {foodItems.map((item) => (
            <View key={item.id} style={styles.foodItem}>
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#DDDDDD",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: "#333333",
  },
  filterContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 16,
  },
  yellowButton: {
    flex: 1,
    backgroundColor: "#FFCC00",
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
    alignItems: "center",
  },
  redButton: {
    flex: 1,
    backgroundColor: "#FF0000",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "bold",
    color: "#333333",
  },
  redButtonText: {
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  divider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginHorizontal: 16,
    marginBottom: 16,
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
