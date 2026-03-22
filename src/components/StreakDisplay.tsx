import { useCallback, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, Card, Text } from "react-native-paper";
import colors from "../constants/colors";
import { supabase } from "../services/supabase";

export type StreakDisplayProps = {
  userId: string;
};

export default function StreakDisplay({ userId }: StreakDisplayProps) {
  const [streak, setStreak] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const prevStreakRef = useRef<number | null>(null);
  const scale = useRef(new Animated.Value(1)).current;

  const fetchStreak = useCallback(async () => {
    if (!userId) {
      setStreak(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("current_streak")
        .eq("id", userId)
        .single();

      if (error) {
        throw error;
      }

      const row = data as { current_streak: number | string | null } | null;
      const next = Number(row?.current_streak ?? 0);

      const prev = prevStreakRef.current;
      if (prev !== null && next > prev) {
        Animated.sequence([
          Animated.spring(scale, {
            toValue: 1.35,
            useNativeDriver: true,
            friction: 4,
          }),
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            friction: 6,
          }),
        ]).start();
      }
      prevStreakRef.current = next;
      setStreak(next);
    } catch {
      setStreak(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      void fetchStreak();
    }, [fetchStreak])
  );

  if (!userId) {
    return null;
  }

  return (
    <Card mode="elevated" style={styles.card}>
      <Card.Content style={styles.content}>
        {loading && streak === null ? (
          <ActivityIndicator color={colors.primary} />
        ) : streak === null ? (
          <Text variant="bodyMedium" style={styles.cta}>
            Unable to load streak
          </Text>
        ) : streak === 0 ? (
          <Text variant="titleMedium" style={styles.cta}>
            Start your streak today!
          </Text>
        ) : (
          <View style={styles.row}>
            <Animated.Text
              style={[styles.fire, { transform: [{ scale }] }]}
              accessibilityLabel="Streak"
            >
              🔥
            </Animated.Text>
            <Text variant="titleMedium" style={styles.streakText}>
              {`${streak ?? 0} Day Streak`}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  fire: {
    fontSize: 24,
  },
  streakText: {
    color: colors.text,
    fontWeight: "600",
  },
  cta: {
    color: colors.textGray,
    textAlign: "center",
  },
});
