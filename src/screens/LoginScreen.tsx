import { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { ActivityIndicator, Button, Text, TextInput } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import colors from "../constants/colors";
import { useAuth } from "../services/auth";

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "Login"
>;

const inputTheme = {
  outlineColor: colors.border,
  activeOutlineColor: colors.primary,
};

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = useCallback(async () => {
    setError(null);
    setSubmitting(true);
    try {
      const { error: signInError } = await signIn(email.trim(), password);
      if (signInError) {
        setError(signInError.message);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }, [email, password, signIn]);

  const goToSignUp = useCallback(() => {
    navigation.navigate("SignUp");
  }, [navigation]);

  const canSubmit =
    email.trim().length > 0 && password.length > 0 && !submitting;

  return (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <View style={styles.inner}>
          <Text variant="headlineMedium" style={styles.title}>
            Log in
          </Text>

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            disabled={submitting}
            style={styles.input}
            outlineColor={inputTheme.outlineColor}
            activeOutlineColor={inputTheme.activeOutlineColor}
            textColor={colors.text}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry
            autoComplete="password"
            textContentType="password"
            disabled={submitting}
            style={styles.input}
            outlineColor={inputTheme.outlineColor}
            activeOutlineColor={inputTheme.activeOutlineColor}
            textColor={colors.text}
          />

          {error ? (
            <Text style={styles.error} accessibilityLiveRegion="polite">
              {error}
            </Text>
          ) : null}

          <Button
            mode="contained"
            onPress={handleLogin}
            disabled={!canSubmit}
            style={styles.button}
            contentStyle={styles.buttonContent}
            buttonColor={colors.primary}
            textColor={colors.card}
          >
            {submitting ? (
              <ActivityIndicator animating color={colors.card} size="small" />
            ) : (
              "Login"
            )}
          </Button>

          <Pressable
            onPress={goToSignUp}
            disabled={submitting}
            accessibilityRole="link"
            accessibilityLabel="Go to sign up"
          >
            <Text style={styles.link}>Don&apos;t have an account? Sign up</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  inner: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
    alignItems: "stretch",
  },
  title: {
    color: colors.text,
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: colors.card,
  },
  error: {
    color: colors.error,
    marginBottom: 12,
    textAlign: "center",
  },
  button: {
    marginTop: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  link: {
    marginTop: 20,
    textAlign: "center",
    color: colors.primary,
    fontSize: 15,
  },
});
