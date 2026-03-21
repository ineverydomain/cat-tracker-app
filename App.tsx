import { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Provider as PaperProvider } from "react-native-paper";
import { AuthProvider } from "./src/services/auth";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  // #region agent log
  useEffect(() => {
    fetch("http://127.0.0.1:7242/ingest/068bdc0a-5c2a-46a4-bbca-105525674a7c", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "App.tsx:useEffect",
        message: "Root App mounted; wraps AppNavigator with NavigationContainer",
        data: {
          hypothesisId: "H1-verify",
          runId: "post-fix",
          outerNavigationContainer: true,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }, []);
  // #endregion
  return (
    <PaperProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </PaperProvider>
  );
}
