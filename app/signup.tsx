import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, StatusBar, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from './context/auth-context';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { signup } = useAuth();
  
  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    try {
      setIsLoading(true);
      await signup(name, email, password);
    } catch (error) {
      Alert.alert('Error', 'Failed to sign up. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      
      <ScrollView className="flex-1">
        <View className="px-6 py-10">
          {/* Back Button */}
          <TouchableOpacity 
            className="bg-[#ffd60a] p-3 rounded-lg w-12 mb-8"
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={24} color="#bb0718" />
          </TouchableOpacity>
          
          {/* Header */}
          <Text className="text-3xl font-bold mb-8">Create an account</Text>
          
          {/* Form */}
          <View className="space-y-6">
            <View>
              <Text className="text-gray-700 mb-2 font-medium">Full Name</Text>
              <TextInput
                className="bg-gray-100 py-4 px-4 rounded-xl"
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
              />
            </View>
            
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
                  <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="gray" />
                </TouchableOpacity>
              </View>
            </View>
            
            <View>
              <Text className="text-gray-700 mb-2 font-medium">Confirm Password</Text>
              <View className="flex-row items-center bg-gray-100 rounded-xl">
                <TextInput
                  className="flex-1 py-4 px-4"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  className="pr-4"
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="gray" />
                </TouchableOpacity>
              </View>
            </View>
            
            <TouchableOpacity 
              className="bg-[#ffd60a] py-4 rounded-xl mt-6"
              onPress={handleSignup}
              disabled={isLoading}
            >
              <Text className="text-center font-bold text-lg">
                {isLoading ? 'Signing up...' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Login Link */}
          <View className="flex-row justify-center mt-8 mb-4">
            <Text className="text-gray-600">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text className="text-[#bb0718] font-medium">Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}