import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { supabase } from "./src/services/supabase";

export default function App() {
  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    console.log("🔍 Step 1: Testing Supabase connection...");
    console.log("URL:", process.env.EXPO_PUBLIC_SUPABASE_URL);
    console.log("Key exists:", !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

    console.log("🔍 Step 2: Fetching topics...");
    const { data, error, status, statusText } = await supabase
      .from("topics")
      .select("*")
      .limit(5);

    console.log("Status:", status);
    console.log("Status Text:", statusText);

    if (error) {
      console.error("❌ Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
    } else {
      console.log("✅ Success! Topics found:", data.length);
      console.log("Topics:", data);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Testing Supabase Connection...</Text>
      <Text style={styles.small}>Check console for results</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  small: {
    fontSize: 12,
    color: "#666",
    marginTop: 10,
  },
});
