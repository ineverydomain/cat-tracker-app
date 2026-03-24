import React, { useEffect, useRef } from "react";
import { StyleSheet, View, Animated } from "react-native";
import { Text } from "react-native-paper";
import colors from "../constants/colors";

interface ProgressBarProps {
  label: string;
  percentage: number;
  color: string;
}

export default function ProgressBar({
  label,
  percentage,
  color,
}: ProgressBarProps) {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: percentage,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  const width = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text variant="bodyMedium" style={styles.label}>
          {label}
        </Text>
        <Text variant="bodyMedium" style={styles.percentage}>
          {Math.round(percentage)}%
        </Text>
      </View>

      <View style={styles.barContainer}>
        <Animated.View
          style={[styles.barFill, { width, backgroundColor: color }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontWeight: "600",
    color: colors.text,
  },
  percentage: {
    fontWeight: "700",
    color: colors.primary,
  },
  barContainer: {
    height: 12,
    backgroundColor: colors.border,
    borderRadius: 6,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 6,
  },
});
