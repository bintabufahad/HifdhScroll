import { createClient } from "@/lib/supabase/server";
import StudyDashboard from "@/components/study/StudyDashboard";
import type { CourseItem, StudyTask } from "@/lib/types";

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

  const [{ data: tasks }, { data: course }] = await Promise.all([
    supabase
      .from("study_tasks")
      .select("id, title, is_done, created_at, completed_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("course_items")
      .select("id, type, url, title, done, position")
      .eq("user_id", user.id)
      .order("position", { ascending: true }),
  ]);

  return (
    <StudyDashboard initialTasks={(tasks as StudyTask[]) ?? []} initialCourse={(course as CourseItem[]) ?? []} />
  );
}
