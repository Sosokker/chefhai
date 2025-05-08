import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { FIREBASE_AUTH } from '../FirebaseConfig';

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true
  });
  
  // Use a single useEffect to check authentication status only once on mount
  useEffect(() => {
    // Check if user is logged in on app start
    async function loadToken() {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        // Update state only once with both values
        setAuthState({
          isAuthenticated: !!token,
          isLoading: false
        });
      } catch (error) {
        console.log('Error loading token:', error);
        setAuthState({
          isAuthenticated: false,
          isLoading: false
        });
      }
    }
    
    loadToken();
  }, []); // Empty dependency array ensures this runs only once
  
  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
      const user: User = userCredential.user;
      const idToken = await user.getIdToken();
      await SecureStore.setItemAsync('userToken', idToken);
      setAuthState({
        ...authState,
        isAuthenticated: true
      });
      router.replace('../(tabs)/home');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
  
  const signup = async (name: string, email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
      const user: User = userCredential.user;
      const idToken = await user.getIdToken();
      await SecureStore.setItemAsync('userToken', idToken);
      setAuthState({
        ...authState,
        isAuthenticated: true
      });
      router.replace('./(tabs)/home');
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };
  
  const logout = async () => {
    try {
      await signOut(FIREBASE_AUTH);
      await SecureStore.deleteItemAsync('userToken');
      setAuthState({
        ...authState,
        isAuthenticated: false
      });
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };
  
  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated: authState.isAuthenticated, 
        isLoading: authState.isLoading, 
        login, 
        signup, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}