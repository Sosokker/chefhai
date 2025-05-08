import { useAuth } from "@/context/auth-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";

export default function TabLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  // If not authenticated and not loading, redirect to welcome
  if (!isLoading && !isAuthenticated) {
    return <Redirect href="/welcome" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#ffd60a",
          height: 70,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: "#bb0718",
        tabBarInactiveTintColor: "#bb0718",
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="recipes"
        options={{
          title: "Recipes",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="notebook-outline"
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="forum"
        options={{
          title: "Forum",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="forum-outline"
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
