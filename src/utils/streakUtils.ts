import type { SupabaseClient } from "@supabase/supabase-js";
import { isToday, isYesterday } from "date-fns";

/**
 * Computes the next streak value from the last activity time and current streak.
 */
export function calculateStreak(
  lastActive: Date | null,
  currentStreak: number
): number {
  if (lastActive === null) {
    return 1;
  }

  const last = lastActive instanceof Date ? lastActive : new Date(lastActive);

  if (isToday(last)) {
    return currentStreak;
  }

  if (isYesterday(last)) {
    return currentStreak + 1;
  }

  return 1;
}

type UserStreakRow = {
  last_active: string | null;
  current_streak: number | string | null;
  longest_streak: number | string | null;
};

/**
 * Loads streak fields from `users`, applies {@link calculateStreak}, writes
 * `current_streak`, `longest_streak`, and `last_active`, and returns the new streak.
 */
export async function updateUserStreak(
  userId: string,
  supabase: SupabaseClient
): Promise<number> {
  const { data, error } = await supabase
    .from("users")
    .select("last_active, current_streak, longest_streak")
    .eq("id", userId)
    .single();

  if (error) {
    throw error;
  }

  const row = data as UserStreakRow | null;
  if (!row) {
    throw new Error("User streak row not found");
  }

  const lastActive = row.last_active ? new Date(row.last_active) : null;
  const currentStreak = Number(row.current_streak ?? 0);
  const longestStreak = Number(row.longest_streak ?? 0);

  const newStreak = calculateStreak(lastActive, currentStreak);
  const newLongest = Math.max(longestStreak, newStreak);

  const nowIso = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("users")
    .update({
      current_streak: newStreak,
      longest_streak: newLongest,
      last_active: nowIso,
    })
    .eq("id", userId);

  if (updateError) {
    throw updateError;
  }

  return newStreak;
}
