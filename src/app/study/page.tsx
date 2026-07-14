import { createClient } from "@/lib/supabase/server";
import StudyDashboard from "@/components/study/StudyDashboard";
import type { StudyTask } from "@/lib/types";

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

  const { data: tasks } = await supabase
    .from("study_tasks")
    .select("id, title, is_done, created_at, completed_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  return <StudyDashboard initialTasks={(tasks as StudyTask[]) ?? []} />;
}
