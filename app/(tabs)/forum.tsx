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

export default function ForumScreen() {
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

        {/* Category Filters */}
        <View className="flex-row justify-between mx-4 mb-4">
          <TouchableOpacity className="bg-[#FFCC00] py-3 px-4 rounded-xl flex-1 mx-1 items-center">
            <Text className="font-bold text-[#333]">Main dish</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-[#FFCC00] py-3 px-4 rounded-xl flex-1 mx-1 items-center">
            <Text className="font-bold text-[#333]">Dessert</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-[#FFCC00] py-3 px-4 rounded-xl flex-1 mx-1 items-center">
            <Text className="font-bold text-[#333]">Appetite</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Options */}
        <View className="flex-row mx-4 mb-4">
          <TouchableOpacity className="bg-red-600 py-2 px-3 rounded-full mr-2 flex-row items-center">
            <Text className="text-white font-bold mr-1">Rating</Text>
            <IconSymbol name="star.fill" size={16} color="#FFCC00" />
          </TouchableOpacity>
          <TouchableOpacity className="bg-red-600 py-2 px-3 rounded-full mr-2 flex-row items-center">
            <Text className="text-white font-bold mr-1">Newest</Text>
            <IconSymbol name="calendar" size={16} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity className="bg-red-600 py-2 px-3 rounded-full mr-2 flex-row items-center">
            <Text className="text-white font-bold mr-1">Best</Text>
            <IconSymbol name="flame.fill" size={16} color="#FFCC00" />
          </TouchableOpacity>
        </View>

        {/* Post */}
        <View className="mx-4 mb-4 bg-white rounded-xl overflow-hidden border border-[#EEEEEE]">
          {/* User Info */}
          <View className="flex-row justify-between items-center px-3 py-2">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-gray-200 justify-center items-center mr-2">
                <IconSymbol
                  name="person.circle.fill"
                  size={24}
                  color="#888888"
                />
              </View>
              <Text className="font-bold text-[#333]">Mr. Chef</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="mr-1 font-bold text-[#333]">4.2</Text>
              <IconSymbol name="star.fill" size={16} color="#FFCC00" />
            </View>
          </View>

          {/* Post Image */}
          <Image
            source={require("@/assets/images/placeholder-food.jpg")}
            className="w-full h-[200px]"
            resizeMode="cover"
          />

          {/* Post Content */}
          <View className="p-3">
            <Text className="text-base font-bold mb-1 text-[#333]">
              Kajjecaw
            </Text>
            <Text className="text-[#666] text-sm">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut at
              hendrerit enim. Etiam lacinia mi nec nunc ornare, vitae tempus leo
              aliquet...
            </Text>
          </View>

          {/* Post Actions */}
          <View className="flex-row border-t border-[#EEEEEE] py-2 px-3">
            <TouchableOpacity className="flex-row items-center mr-4">
              <IconSymbol
                name="arrowshape.turn.up.left.fill"
                size={16}
                color="#888888"
              />
              <Text className="ml-1 text-[#888]">3</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center mr-4">
              <IconSymbol name="text.bubble.fill" size={16} color="#888888" />
              <Text className="ml-1 text-[#888]">2</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center mr-4">
              <IconSymbol name="heart.fill" size={16} color="#888888" />
              <Text className="ml-1 text-[#888]">2</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center mr-4">
              <IconSymbol name="bookmark.fill" size={16} color="#888888" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
