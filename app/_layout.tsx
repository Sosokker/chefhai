import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="recipe-detail"
          options={{
            headerShown: false,
            presentation: "card",
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
