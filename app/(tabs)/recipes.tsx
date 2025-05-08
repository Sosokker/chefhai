import { IconSymbol } from "@/components/ui/IconSymbol";
import { Image } from "expo-image";
import {
  ScrollView,
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
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView className="flex-1">
        {/* Search Bar */}
        <View className="flex-row items-center mx-4 mt-2 mb-4 px-3 h-10 bg-white rounded-full border border-gray-300">
          <IconSymbol name="magnifyingglass" size={20} color="#FF0000" />
          <TextInput
            className="flex-1 ml-2 text-[#333]"
            placeholder="Search"
            placeholderTextColor="#FF0000"
          />
        </View>

        {/* Filter Buttons */}
        <View className="flex-row mx-4 mb-4">
          <TouchableOpacity className="flex-1 bg-[#FFCC00] py-3 rounded-lg mr-2 items-center">
            <Text className="font-bold text-[#333]">All Recipes</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-red-600 py-3 rounded-lg items-center">
            <Text className="font-bold text-white">My Recipes</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View className="h-px bg-[#EEEEEE] mx-4 mb-4" />

        {/* Food Grid */}
        <View className="flex-row flex-wrap p-2">
          {foodItems.map((item) => (
            <View key={item.id} className="w-1/2 p-2 relative">
              <Image
                source={item.image}
                className="w-full h-[120px] rounded-lg"
                resizeMode="cover"
              />
              <View
                className="absolute bottom-4 left-4 py-1 px-2 rounded bg-opacity-90"
                style={{ backgroundColor: item.color }}
              >
                <Text className="text-[#333] font-bold text-xs">
                  {item.name}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
