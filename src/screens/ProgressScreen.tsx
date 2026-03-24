import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, RefreshControl } from "react-native";
import { Text, Card, ActivityIndicator } from "react-native-paper";
import { supabase } from "../services/supabase";
import { useAuth } from "../services/auth";
import ProgressRing from "../components/ProgressRing";
import ProgressBar from "../components/ProgressBar";
import colors from "../constants/colors";

interface ProgressStats {
  overall: number;
  varc: number;
  dilr: number;
  qa: number;
  thisWeek: number;
  totalTopics: number;
  completedTopics: number;
}

export default function ProgressScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ProgressStats>({
    overall: 0,
    varc: 0,
    dilr: 0,
    qa: 0,
    thisWeek: 0,
    totalTopics: 0,
    completedTopics: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProgress();
  }, [user]);

  const fetchProgress = async () => {
    if (!user) return;

    try {
      // Get total topics count
      const { count: totalTopics } = await supabase
        .from("topics")
        .select("*", { count: "exact", head: true });

      // Get user's completed topics
      const { data: progressData } = await supabase
        .from("user_progress")
        .select("topic_id, status, completed_at")
        .eq("user_id", user.id)
        .eq("status", "done");

      const completedTopics = progressData?.length || 0;
      const overall = totalTopics ? (completedTopics / totalTopics) * 100 : 0;

      // Get section-wise progress
      const sectionProgress = await calculateSectionProgress(user.id);

      // Calculate this week's progress
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const thisWeekCount =
        progressData?.filter(
          (item) => item.completed_at && new Date(item.completed_at) > weekAgo,
        ).length || 0;

      setStats({
        overall,
        varc: sectionProgress.VARC,
        dilr: sectionProgress.DILR,
        qa: sectionProgress.QA,
        thisWeek: thisWeekCount,
        totalTopics: totalTopics || 0,
        completedTopics,
      });

      console.log("✅ Progress loaded:", {
        overall: Math.round(overall),
        completed: completedTopics,
        total: totalTopics,
      });
    } catch (error) {
      console.error("Error fetching progress:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateSectionProgress = async (userId: string) => {
    const sections = ["VARC", "DILR", "QA"];
    const progress: Record<string, number> = {};

    for (const section of sections) {
      try {
        // Get all topics in this section
        const { data: sectionTopics } = await supabase
          .from("topics")
          .select("id")
          .eq("section", section);

        const topicIds = sectionTopics?.map((t) => t.id) || [];
        const sectionTotal = topicIds.length;

        if (sectionTotal === 0) {
          progress[section] = 0;
          continue;
        }

        // Get completed topics in this section
        const { data: completedInSection } = await supabase
          .from("user_progress")
          .select("topic_id")
          .eq("user_id", userId)
          .eq("status", "done")
          .in("topic_id", topicIds); // topicIds is now an array ✅

        const completed = completedInSection?.length || 0;
        progress[section] = (completed / sectionTotal) * 100;

        console.log(
          `${section}: ${completed}/${sectionTotal} = ${Math.round(progress[section])}%`,
        );
      } catch (error) {
        console.error(`Error calculating ${section} progress:`, error);
        progress[section] = 0;
      }
    }

    return progress;
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProgress();
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Overall Progress Ring */}
      <Card style={styles.card}>
        <Card.Content style={styles.ringContainer}>
          <Text variant="headlineSmall" style={styles.sectionTitle}>
            Overall Progress
          </Text>
          <ProgressRing percentage={stats.overall} />
          <Text variant="bodyMedium" style={styles.statsText}>
            {stats.completedTopics} of {stats.totalTopics} topics mastered
          </Text>
        </Card.Content>
      </Card>

      {/* Section-wise Progress */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.sectionTitle}>
            Section-wise Progress
          </Text>

          <ProgressBar
            label="VARC"
            percentage={stats.varc}
            color={colors.success}
          />

          <ProgressBar
            label="DILR"
            percentage={stats.dilr}
            color={colors.primary}
          />

          <ProgressBar
            label="QA"
            percentage={stats.qa}
            color={colors.warning}
          />
        </Card.Content>
      </Card>

      {/* This Week Stats */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.sectionTitle}>
            This Week
          </Text>

          <View style={styles.weekStatsContainer}>
            <View style={styles.weekStat}>
              <Text variant="displaySmall" style={styles.weekNumber}>
                {stats.thisWeek}
              </Text>
              <Text variant="bodyMedium" style={styles.weekLabel}>
                Topics Completed
              </Text>
            </View>

            {stats.thisWeek > 0 && (
              <Text variant="bodyMedium" style={styles.encouragement}>
                🔥 Great progress this week!
              </Text>
            )}

            {stats.thisWeek === 0 && (
              <Text variant="bodyMedium" style={styles.encouragement}>
                💪 Start strong this week!
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  card: {
    margin: 16,
    backgroundColor: colors.card,
  },
  ringContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  sectionTitle: {
    fontWeight: "700",
    color: colors.text,
    marginBottom: 20,
  },
  statsText: {
    color: colors.textGray,
    marginTop: 16,
  },
  weekStatsContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  weekStat: {
    alignItems: "center",
    marginBottom: 16,
  },
  weekNumber: {
    fontWeight: "700",
    color: colors.primary,
  },
  weekLabel: {
    color: colors.textGray,
    marginTop: 4,
  },
  encouragement: {
    color: colors.success,
    fontWeight: "600",
    textAlign: "center",
  },
  bottomPadding: {
    height: 40,
  },
});
