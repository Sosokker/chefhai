import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from './context/auth-context';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading indicator while checking auth status
  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator size="large" color="#ffd60a" />
      </View>
    );
  }

  // Redirect based on authentication status
  if (isAuthenticated) {
    return <Redirect href="/welcome" />;
  } else {
    return <Redirect href="/welcome" />;
  }
}