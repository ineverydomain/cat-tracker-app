import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../services/supabase";
import type { ProgressStatus, Section, Topic, UserProgress } from "../types";

export type ProgressByTopicId = Record<string, UserProgress>;

function mapTopicRow(row: Record<string, unknown>): Topic {
  return {
    id: String(row.id),
    section: row.section as Section,
    category: String(row.category ?? ""),
    name: String(row.name ?? ""),
    difficulty: String(row.difficulty ?? "3"),
    estimated_hours: Number(row.estimated_hours ?? 0),
  };
}

function mapProgressRow(row: Record<string, unknown>): UserProgress {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    topic_id: String(row.topic_id),
    status: row.status as ProgressStatus,
    started_at:
      row.started_at === null || row.started_at === undefined
        ? null
        : String(row.started_at),
    completed_at:
      row.completed_at === null || row.completed_at === undefined
        ? null
        : String(row.completed_at),
    notes:
      row.notes === null || row.notes === undefined
        ? null
        : String(row.notes),
  };
}

function buildTimestampsForStatus(
  status: ProgressStatus,
  existing: UserProgress | undefined
): { started_at: string | null; completed_at: string | null } {
  const now = new Date().toISOString();
  let started_at = existing?.started_at ?? null;
  let completed_at = existing?.completed_at ?? null;

  if (status === "not_started") {
    return { started_at: null, completed_at: null };
  }
  if (status === "in_progress") {
    return { started_at: started_at ?? now, completed_at: null };
  }
  return {
    started_at: started_at ?? now,
    completed_at: completed_at ?? now,
  };
}

async function upsertUserProgress(
  userId: string,
  topicId: string,
  status: ProgressStatus,
  existing: UserProgress | undefined
): Promise<UserProgress> {
  const { started_at, completed_at } = buildTimestampsForStatus(
    status,
    existing
  );

  const base = {
    user_id: userId,
    topic_id: topicId,
    status,
    started_at,
    completed_at,
    notes: existing?.notes ?? null,
  };

  if (existing?.id) {
    const { data, error } = await supabase
      .from("user_progress")
      .update(base)
      .eq("id", existing.id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return mapProgressRow(data as Record<string, unknown>);
  }

  const { data, error } = await supabase
    .from("user_progress")
    .insert(base)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return mapProgressRow(data as Record<string, unknown>);
}

export function useSyllabusSection(
  section: Section,
  userId: string | undefined
) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [progressByTopicId, setProgressByTopicId] =
    useState<ProgressByTopicId>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const progressRef = useRef(progressByTopicId);

  useEffect(() => {
    progressRef.current = progressByTopicId;
  }, [progressByTopicId]);

  const load = useCallback(
    async (mode: "initial" | "refresh") => {
      if (!userId) {
        setTopics([]);
        setProgressByTopicId({});
        setLoading(false);
        setRefreshing(false);
        setError(null);
        return;
      }

      if (mode === "initial") {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);

      try {
        const { data: topicRows, error: topicsError } = await supabase
          .from("topics")
          .select("*")
          .eq("section", section)
          .order("name", { ascending: true });

        if (topicsError) {
          throw new Error(topicsError.message);
        }

        const mappedTopics = (topicRows ?? []).map((r) =>
          mapTopicRow(r as Record<string, unknown>)
        );
        const topicIds = mappedTopics.map((t) => t.id);

        let nextProgress: ProgressByTopicId = {};
        if (topicIds.length > 0) {
          const { data: progressRows, error: progressError } = await supabase
            .from("user_progress")
            .select("*")
            .eq("user_id", userId)
            .in("topic_id", topicIds);

          if (progressError) {
            throw new Error(progressError.message);
          }

          for (const row of progressRows ?? []) {
            const p = mapProgressRow(row as Record<string, unknown>);
            nextProgress[p.topic_id] = p;
          }
        }

        setTopics(mappedTopics);
        setProgressByTopicId(nextProgress);
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Failed to load syllabus data.";
        setError(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [section, userId]
  );

  useEffect(() => {
    void load("initial");
  }, [load]);

  const refresh = useCallback(() => {
    void load("refresh");
  }, [load]);

  const updateStatus = useCallback(
    async (topicId: string, status: ProgressStatus): Promise<boolean> => {
      if (!userId) {
        return false;
      }

      const existing = progressRef.current[topicId];
      setError(null);

      try {
        const updated = await upsertUserProgress(
          userId,
          topicId,
          status,
          existing
        );
        setProgressByTopicId((prev) => ({
          ...prev,
          [topicId]: updated,
        }));
        return true;
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Could not update progress.";
        setError(message);
        return false;
      }
    },
    [userId]
  );

  return {
    topics,
    progressByTopicId,
    loading,
    refreshing,
    error,
    refresh,
    updateStatus,
    reload: () => void load("initial"),
  };
}
