import { StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import colors from "../constants/colors";
import { useAuth } from "../services/auth";

export default function HomeScreen() {
  const { user, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Card style={styles.card} mode="elevated">
        <Card.Content style={styles.content}>
          <Text variant="headlineSmall" style={styles.title}>
            Welcome to CAT Tracker
          </Text>
          <Text variant="bodyLarge" style={styles.email}>
            {user?.email ?? "—"}
          </Text>
        </Card.Content>
        <Card.Actions style={styles.actions}>
          <Button
            mode="contained"
            onPress={() => {
              void signOut();
            }}
            buttonColor={colors.primary}
            textColor={colors.card}
            style={styles.logoutButton}
          >
            Logout
          </Button>
        </Card.Actions>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: colors.card,
    maxWidth: 400,
    alignSelf: "center",
    width: "100%",
  },
  content: {
    alignItems: "center",
    paddingTop: 8,
  },
  title: {
    color: colors.text,
    textAlign: "center",
    marginBottom: 12,
  },
  email: {
    color: colors.textGray,
    textAlign: "center",
  },
  actions: {
    justifyContent: "center",
    paddingBottom: 16,
    paddingTop: 8,
  },
  logoutButton: {
    minWidth: 120,
  },
});
