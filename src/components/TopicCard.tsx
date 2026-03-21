import React, { useCallback } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Card, Chip, IconButton, Text } from "react-native-paper";
import colors from "../constants/colors";
import type { ProgressStatus, Topic } from "../types";

export interface TopicCardProps {
  topic: Topic;
  status: ProgressStatus;
  onPress: () => void;
  onStatusChange: (next: ProgressStatus) => void;
}

function parseDifficulty(topic: Topic): number {
  const parsed = parseInt(topic.difficulty, 10);
  if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= 5) {
    return parsed;
  }
  const n = Number(topic.difficulty);
  if (Number.isFinite(n) && n >= 1 && n <= 5) {
    return Math.round(n);
  }
  return 3;
}

function nextProgressStatus(current: ProgressStatus): ProgressStatus {
  if (current === "not_started") return "in_progress";
  if (current === "in_progress") return "done";
  return "not_started";
}

export default function TopicCard({
  topic,
  status,
  onPress,
  onStatusChange,
}: TopicCardProps) {
  const difficulty = parseDifficulty(topic);

  const getStatusColor = () => {
    switch (status) {
      case "done":
        return colors.success;
      case "in_progress":
        return colors.warning;
      default:
        return colors.textGray;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "done":
        return "check-circle";
      case "in_progress":
        return "circle-half-full";
      default:
        return "circle-outline";
    }
  };

  const getDifficultyColor = () => {
    if (difficulty <= 2) return colors.success;
    if (difficulty === 3) return colors.warning;
    return colors.error;
  };

  const handleStatusPress = useCallback(() => {
    const next = nextProgressStatus(status);
    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/068bdc0a-5c2a-46a4-bbca-105525674a7c", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "TopicCard.tsx:handleStatusPress",
        message: "Status cycle",
        data: {
          hypothesisId: "H1-verify",
          runId: "post-fix",
          topicId: topic.id,
          previousStatus: status,
          nextStatus: next,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    onStatusChange(next);
  }, [onStatusChange, status, topic.id]);

  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.mainTouch}
            onPress={onPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`Open ${topic.name}`}
          >
            <Text variant="titleMedium" style={styles.topicName}>
              {topic.name}
            </Text>
            <Text variant="bodySmall" style={styles.category}>
              {topic.category}
            </Text>
          </TouchableOpacity>

          <IconButton
            icon={getStatusIcon()}
            iconColor={getStatusColor()}
            size={32}
            style={styles.iconButton}
            onPress={handleStatusPress}
            accessibilityLabel="Cycle progress: not started, in progress, done"
          />
        </View>

        <View style={styles.footer}>
          <Chip
            mode="flat"
            textStyle={[styles.chipText, { color: getDifficultyColor() }]}
            style={[
              styles.difficultyChip,
              { backgroundColor: `${getDifficultyColor()}20` },
            ]}
          >
            {`${"★".repeat(difficulty)}${"☆".repeat(5 - difficulty)}`}
          </Chip>
          <Text variant="bodySmall" style={styles.difficultyText}>
            Difficulty: {difficulty}/5
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: colors.card,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  mainTouch: {
    flex: 1,
    paddingRight: 8,
  },
  topicName: {
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  category: {
    color: colors.textGray,
  },
  iconButton: {
    margin: 0,
    marginTop: -4,
  },
  footer: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  difficultyChip: {
    height: 28,
    paddingHorizontal: 8,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
  },
  difficultyText: {
    color: colors.textGray,
    fontSize: 12,
  },
});
