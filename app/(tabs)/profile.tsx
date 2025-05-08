import { View, Text } from 'react-native';

export default function ProfileScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold">Profile Screen</Text>
      <Text className="mt-2 text-gray-500">Your profile information will appear here</Text>
    </View>
  );
}