import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabase";

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true,
  });

  // Use a single useEffect to check authentication status only once on mount
  useEffect(() => {
    // Check if user is logged in on app start
    async function loadSession() {
      try {
        const sessionStr = await SecureStore.getItemAsync("sbSession");
        let session = null;
        if (sessionStr) {
          session = JSON.parse(sessionStr);
        }
        setAuthState({
          isAuthenticated: !!session,
          isLoading: false,
        });
      } catch (error) {
        console.log("Error loading session:", error);
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
        });
      }
    }

    loadSession();

    // Listen to Supabase auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          await SecureStore.setItemAsync("sbSession", JSON.stringify(session));
          setAuthState({ isAuthenticated: true, isLoading: false });
        } else if (event === "SIGNED_OUT") {
          await SecureStore.deleteItemAsync("sbSession");
          setAuthState({ isAuthenticated: false, isLoading: false });
        }
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        throw error;
      }
      if (data.session) {
        await SecureStore.setItemAsync(
          "sbSession",
          JSON.stringify(data.session)
        );
        setAuthState({ ...authState, isAuthenticated: true, isLoading: false });
        router.replace("../(tabs)/home");
      } else {
        setAuthState({
          ...authState,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        throw error;
      }
      if (data.session) {
        await SecureStore.setItemAsync(
          "sbSession",
          JSON.stringify(data.session)
        );
        setAuthState({ ...authState, isAuthenticated: true, isLoading: false });
        router.replace("./(tabs)/home");
      } else {
        setAuthState({
          ...authState,
          isAuthenticated: false,
          isLoading: false,
        });
        // Optionally, prompt user to check email for verification
      }
    } catch (error) {
      console.error("Signup error:", error);
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      await SecureStore.deleteItemAsync("sbSession");
      setAuthState({ ...authState, isAuthenticated: false });
      router.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
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
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
