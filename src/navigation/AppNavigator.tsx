import { StyleSheet, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProgressScreen from "../screens/ProgressScreen";
import colors from "../constants/colors";
import { useAuth } from "../services/auth";
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import SignUpScreen from "../screens/SignUpScreen";
import SyllabusScreen from "../screens/SyllabusScreen";
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
      <AppStack.Screen
        name="Syllabus"
        component={SyllabusScreen}
        options={{ headerShown: true, title: "CAT Syllabus" }}
      />
      <AppStack.Screen
        name="Progress"
        component={ProgressScreen}
        options={{ headerShown: true, title: "Your Progress" }}
      />
    </AppStack.Navigator>
  );
}

function AuthLoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator animating size="large" color={colors.primary} />
    </View>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

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
