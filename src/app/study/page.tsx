import { createClient } from "@/lib/supabase/server";
import StudyDashboard from "@/components/study/StudyDashboard";
import type { ProfileStats, StudyTask } from "@/lib/types";

const EMPTY_STATS: ProfileStats = {
  points: 0,
  current_streak: 0,
  longest_streak: 0,
  last_study_date: null,
  total_study_seconds: 0,
};

export default async function StudyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The proxy already redirects signed-out visitors away from /study, so
  // user should always be set here; this is just a defensive fallback.
  if (!user) {
    return null;
  }

  const [{ data: profile }, { data: tasks }] = await Promise.all([
    supabase
      .from("profiles")
      .select("points, current_streak, longest_streak, last_study_date, total_study_seconds")
      .eq("id", user.id)
      .single(),
    supabase
      .from("study_tasks")
      .select("id, title, is_done, created_at, completed_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
  ]);

  return (
    <StudyDashboard initialStats={profile ?? EMPTY_STATS} initialTasks={(tasks as StudyTask[]) ?? []} />
  );
}
