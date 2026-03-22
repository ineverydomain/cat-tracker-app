import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { useRoute, type RouteProp } from "@react-navigation/native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Button, Searchbar, Text } from "react-native-paper";
import TopicCard from "../components/TopicCard";
import colors from "../constants/colors";
import { useSyllabusSection } from "../hooks/useSyllabusSection";
import { useAuth } from "../services/auth";
import { supabase } from "../services/supabase";
import type { ProgressStatus, Section, Topic } from "../types";
import type { SyllabusTabParamList } from "../navigation/types";
import CountdownTimer from "../components/CountdownTimer";
import { updateUserStreak } from "../utils/streakUtils";

type SyllabusSearchContextValue = {
  query: string;
  setQuery: (q: string) => void;
};

const SyllabusSearchContext = createContext<SyllabusSearchContextValue | null>(
  null,
);

function useSyllabusSearch(): SyllabusSearchContextValue {
  const ctx = useContext(SyllabusSearchContext);
  if (!ctx) {
    throw new Error("useSyllabusSearch must be used within SyllabusScreen");
  }
  return ctx;
}

const Tab = createMaterialTopTabNavigator<SyllabusTabParamList>();

function filterTopics(topics: Topic[], query: string): Topic[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return topics;
  }
  return topics.filter(
    (t) =>
      t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q),
  );
}

function SyllabusSkeleton() {
  return (
    <View style={styles.skeletonWrap} accessibilityLabel="Loading topics">
      {[1, 2, 3, 4, 5, 6].map((k) => (
        <View key={k} style={styles.skeletonCard} />
      ))}
    </View>
  );
}

function SectionTopicsTab() {
  const route =
    useRoute<RouteProp<SyllabusTabParamList, keyof SyllabusTabParamList>>();
  const section = route.name as Section;
  const { user } = useAuth();
  const { query } = useSyllabusSearch();
  const {
    topics,
    progressByTopicId,
    loading,
    refreshing,
    error,
    refresh,
    updateStatus,
    reload,
  } = useSyllabusSection(section, user?.id);

  const filtered = useMemo(() => filterTopics(topics, query), [topics, query]);

  const getStatus = useCallback(
    (topicId: string): ProgressStatus => {
      return progressByTopicId[topicId]?.status ?? "not_started";
    },
    [progressByTopicId],
  );

  const handleStatusChange = useCallback(
    async (topicId: string, newStatus: ProgressStatus) => {
      // #region agent log
      fetch(
        "http://127.0.0.1:7242/ingest/068bdc0a-5c2a-46a4-bbca-105525674a7c",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "SyllabusScreen.tsx:handleStatusChange",
            message: "Parent received status update",
            data: {
              hypothesisId: "H1-verify",
              runId: "post-fix",
              topicId,
              status: newStatus,
              statusIsDefined:
                newStatus === "not_started" ||
                newStatus === "in_progress" ||
                newStatus === "done",
            },
            timestamp: Date.now(),
          }),
        },
      ).catch(() => {});
      // #endregion

      const ok = await updateStatus(topicId, newStatus);

      if (ok && newStatus === "done" && user?.id) {
        try {
          const newStreak = await updateUserStreak(user.id, supabase);
          console.log("Streak updated:", newStreak);
        } catch (e) {
          console.error("Streak update failed:", e);
        }
      }
    },
    [updateStatus, user?.id],
  );

  const emptyMessage =
    topics.length === 0
      ? "No topics for this section yet."
      : "No topics match your search.";

  if (loading && !refreshing) {
    return (
      <View style={styles.tabBody}>
        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
            <Button mode="contained" onPress={() => reload()} compact>
              Retry
            </Button>
          </View>
        ) : null}
        <SyllabusSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.tabBody}>
      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <Button mode="contained" onPress={() => reload()} compact>
            Retry
          </Button>
        </View>
      ) : null}

      <FlatList<Topic>
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TopicCard
            topic={item}
            status={getStatus(item.id)}
            onPress={() => {}}
            onStatusChange={(next) => handleStatusChange(item.id, next)}
          />
        )}
        contentContainerStyle={
          filtered.length === 0 ? styles.listEmpty : styles.listContent
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="book-open-variant"
              size={48}
              color={colors.textGray}
            />
            <Text variant="bodyLarge" style={styles.emptyTitle}>
              {emptyMessage}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />
    </View>
  );
}

export default function SyllabusScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  const searchContextValue = useMemo(
    () => ({ query: searchQuery, setQuery: setSearchQuery }),
    [searchQuery],
  );

  return (
    <SyllabusSearchContext.Provider value={searchContextValue}>
      <View style={styles.root}>
        <Searchbar
          placeholder="Search topics or categories"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.search}
          inputStyle={styles.searchInput}
        />
        <CountdownTimer examDate={new Date("2026-11-29")} />

        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textGray,
            tabBarIndicatorStyle: { backgroundColor: colors.primary },
            tabBarLabelStyle: {
              fontWeight: "600",
              textTransform: "none",
              fontSize: 14,
            },
            tabBarStyle: {
              backgroundColor: colors.card,
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: colors.border,
            },
          }}
        >
          <Tab.Screen
            name="VARC"
            component={SectionTopicsTab}
            options={{ title: "VARC" }}
          />
          <Tab.Screen
            name="DILR"
            component={SectionTopicsTab}
            options={{ title: "DILR" }}
          />
          <Tab.Screen
            name="QA"
            component={SectionTopicsTab}
            options={{ title: "QA" }}
          />
        </Tab.Navigator>
      </View>
    </SyllabusSearchContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  search: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    elevation: 0,
    backgroundColor: colors.card,
  },
  searchInput: {
    minHeight: 0,
  },
  tabBody: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  listContent: {
    paddingBottom: 24,
  },
  listEmpty: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  skeletonWrap: {},
  skeletonCard: {
    height: 104,
    borderRadius: 12,
    backgroundColor: colors.border,
    marginBottom: 12,
  },
  errorBanner: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.error,
    gap: 8,
  },
  errorText: {
    color: colors.error,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyTitle: {
    color: colors.textGray,
    textAlign: "center",
  },
});
