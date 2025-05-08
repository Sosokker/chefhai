import { useAuth } from "@/context/auth-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
    } catch (error) {
      Alert.alert("Error", "Failed to login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      <View className="px-6 py-10 flex-1">
        {/* Back Button */}
        <TouchableOpacity
          className="bg-[#ffd60a] p-3 rounded-lg w-12 mb-8"
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color="#bb0718" />
        </TouchableOpacity>

        {/* Header */}
        <Text className="text-3xl font-bold mb-8">Login to your account</Text>

        {/* Form */}
        <View className="space-y-6">
          <View>
            <Text className="text-gray-700 mb-2 font-medium">Email</Text>
            <TextInput
              className="bg-gray-100 py-4 px-4 rounded-xl"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View>
            <Text className="text-gray-700 mb-2 font-medium">Password</Text>
            <View className="flex-row items-center bg-gray-100 rounded-xl">
              <TextInput
                className="flex-1 py-4 px-4"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                className="pr-4"
                onPress={() => setShowPassword(!showPassword)}
              >
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity>
            <Text className="text-right text-[#bb0718] font-medium">
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-[#ffd60a] py-4 rounded-xl mt-6"
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text className="text-center font-bold text-lg">
              {isLoading ? "Logging in..." : "Login"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sign Up Link */}
        <View className="flex-row justify-center mt-8">
          <Text className="text-gray-600">Don&apos;t have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/signup")}>
            <Text className="text-[#bb0718] font-medium">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
