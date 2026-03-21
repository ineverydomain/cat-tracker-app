import { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Button,
  HelperText,
  Text,
  TextInput,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import colors from "../constants/colors";
import { useAuth } from "../services/auth";
import type { AuthStackParamList } from "./LoginScreen";

type SignUpScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "SignUp"
>;

const inputTheme = {
  outlineColor: colors.border,
  activeOutlineColor: colors.primary,
};

function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

function isValidPassword(value: string): boolean {
  return value.length >= 6;
}

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
};

export default function SignUpScreen() {
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearSuccess = useCallback(() => {
    setSuccessMessage(null);
  }, []);

  const validateFields = useCallback((): boolean => {
    const next: FieldErrors = {};

    if (!name.trim()) {
      next.name = "Name is required.";
    }

    if (!email.trim()) {
      next.email = "Email is required.";
    } else if (!isValidEmail(email)) {
      next.email = "Enter a valid email address.";
    }

    if (!password) {
      next.password = "Password is required.";
    } else if (!isValidPassword(password)) {
      next.password = "Password must be at least 6 characters.";
    }

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }, [name, email, password]);

  const handleSignUp = useCallback(async () => {
    setError(null);
    clearSuccess();

    if (!validateFields()) {
      return;
    }

    setSubmitting(true);
    try {
      const { error: signUpError } = await signUp(
        email.trim(),
        password,
        name.trim(),
      );

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      setFieldErrors({});
      setSuccessMessage(
        "Account created successfully. You can sign in now, or check your email if confirmation is required.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }, [email, password, name, signUp, validateFields, clearSuccess]);

  const goToLogin = useCallback(() => {
    navigation.navigate("Login");
  }, [navigation]);

  const canSubmit =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length > 0 &&
    !submitting;

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
            Sign up
          </Text>

          <TextInput
            label="Name"
            value={name}
            onChangeText={(t) => {
              setName(t);
              setError(null);
              clearSuccess();
              setFieldErrors((prev) => ({ ...prev, name: undefined }));
            }}
            mode="outlined"
            autoComplete="name"
            textContentType="name"
            disabled={submitting}
            style={styles.input}
            outlineColor={inputTheme.outlineColor}
            activeOutlineColor={inputTheme.activeOutlineColor}
            textColor={colors.text}
            error={!!fieldErrors.name}
          />
          <HelperText type="error" visible={!!fieldErrors.name}>
            {fieldErrors.name}
          </HelperText>

          <TextInput
            label="Email"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setError(null);
              clearSuccess();
              setFieldErrors((prev) => ({ ...prev, email: undefined }));
            }}
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
            error={!!fieldErrors.email}
          />
          <HelperText type="error" visible={!!fieldErrors.email}>
            {fieldErrors.email}
          </HelperText>

          <TextInput
            label="Password"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              clearSuccess();
              setFieldErrors((prev) => ({ ...prev, password: undefined }));
            }}
            mode="outlined"
            secureTextEntry
            autoComplete="password-new"
            textContentType="newPassword"
            disabled={submitting}
            style={styles.input}
            outlineColor={inputTheme.outlineColor}
            activeOutlineColor={inputTheme.activeOutlineColor}
            textColor={colors.text}
            error={!!fieldErrors.password}
          />
          <HelperText type="error" visible={!!fieldErrors.password}>
            {fieldErrors.password}
          </HelperText>

          {error ? (
            <Text style={styles.error} accessibilityLiveRegion="polite">
              {error}
            </Text>
          ) : null}

          {successMessage ? (
            <Text
              style={styles.success}
              accessibilityLiveRegion="polite"
              accessibilityRole="alert"
            >
              {successMessage}
            </Text>
          ) : null}

          <Button
            mode="contained"
            onPress={handleSignUp}
            disabled={!canSubmit}
            style={styles.button}
            contentStyle={styles.buttonContent}
            buttonColor={colors.primary}
            textColor={colors.card}
          >
            {submitting ? (
              <ActivityIndicator animating color={colors.card} size="small" />
            ) : (
              "Sign Up"
            )}
          </Button>

          <Pressable
            onPress={goToLogin}
            disabled={submitting}
            accessibilityRole="link"
            accessibilityLabel="Go to login"
          >
            <Text style={styles.link}>Already have an account? Login</Text>
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
    marginBottom: 0,
    backgroundColor: colors.card,
  },
  error: {
    color: colors.error,
    marginBottom: 12,
    textAlign: "center",
  },
  success: {
    color: colors.success,
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
