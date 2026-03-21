export type Section = "VARC" | "DILR" | "QA";

export type ProgressStatus = "not_started" | "in_progress" | "done";

export type Topic = {
  id: string;
  section: Section;
  category: string;
  name: string;
  difficulty: string;
  estimated_hours: number;
};

export type UserProgress = {
  id: string;
  user_id: string;
  topic_id: string;
  status: ProgressStatus;
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
};
