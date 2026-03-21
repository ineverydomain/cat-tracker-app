import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import colors from "../constants/colors";
import { useAuth } from "../services/auth";
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import SignUpScreen from "../screens/SignUpScreen";
import type { AppStackParamList, AuthStackParamList } from "./types";

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

function AuthStackNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
}

function AppStackNavigator() {
  return (
    <AppStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AppStack.Screen name="Home" component={HomeScreen} />
    </AppStack.Navigator>
  );
}

function AuthLoadingScreen() {
  return (
    <View style={styles.loading} accessibilityLabel="Loading authentication">
      <ActivityIndicator animating size="large" color={colors.primary} />
    </View>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  // #region agent log
  useEffect(() => {
    fetch("http://127.0.0.1:7242/ingest/068bdc0a-5c2a-46a4-bbca-105525674a7c", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "AppNavigator.tsx:useEffect",
        message: "Auth state snapshot",
        data: {
          hypothesisId: "H1-verify",
          runId: "post-fix",
          loading,
          hasUser: !!user,
          stacksMountWithoutNestedContainer: !loading,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }, [loading, user]);
  // #endregion

  if (loading) {
    return <AuthLoadingScreen />;
  }

  return user ? <AppStackNavigator /> : <AuthStackNavigator />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
});
