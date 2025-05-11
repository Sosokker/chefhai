import { IconSymbol } from "@/components/ui/IconSymbol";
import { Image } from "expo-image";
import { TouchableOpacity, View, Text } from "react-native";

interface RecipeHighlightCardProps {
  recipe: {
    id: number;
    name: string;
    description?: string;
    image_url?: string;
    time_to_cook_minutes?: number;
    calories?: number;
  };
  onPress?: () => void;
}

export default function RecipeHighlightCard({ recipe, onPress }: RecipeHighlightCardProps) {
  return (
    <TouchableOpacity
      className="flex-1 bg-white rounded-2xl shadow-lg mb-4 overflow-hidden"
      style={{ marginRight: 12, elevation: 4 }}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View className="relative">
        {recipe.image_url ? (
          <Image
            source={{ uri: recipe.image_url }}
            className="w-full h-36"
            contentFit="cover"
          />
        ) : (
          <View className="items-center justify-center w-full h-36 bg-gray-200">
            <Text className="text-gray-400">No Image</Text>
          </View>
        )}
        {/* Calories badge */}
        {recipe.calories !== undefined && (
          <View className="absolute top-2 right-2 bg-[#ffd60a] px-2 py-1 rounded-full shadow">
            <Text className="text-xs font-bold text-[#bb0718]">{recipe.calories} kcal</Text>
          </View>
        )}
      </View>
      <View className="p-4">
        <Text className="text-lg font-bold text-[#222] mb-1" numberOfLines={1}>
          {recipe.name}
        </Text>
        <Text className="text-sm text-[#666] mb-2" numberOfLines={2}>
          {recipe.description || "No description"}
        </Text>
        <View className="flex-row items-center mt-1">
          <IconSymbol name="clock" size={14} color="#bb0718" />
          <Text className="text-xs text-[#bb0718] ml-1 font-semibold">
            {recipe.time_to_cook_minutes ? `${recipe.time_to_cook_minutes} min` : "-"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
