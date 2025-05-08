import { View, Text } from 'react-native';

export default function RecipesScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold">Recipes Screen</Text>
      <Text className="mt-2 text-gray-500">Your recipes will appear here</Text>
    </View>
  );
}