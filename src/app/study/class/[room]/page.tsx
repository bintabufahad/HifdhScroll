import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ClassRoom from "@/components/study/ClassRoom";
import type { CourseItem, StudyClass, StudyTask } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ClassRoomPage({ params }: { params: Promise<{ room: string }> }) {
  const { room } = await params;
  const supabase = await createClient();

  // Classes are publicly readable (RLS), so a guest with the link resolves it too.
  const { data: studyClass } = await supabase
    .from("classes")
    .select("id, owner_id, name, room, created_at")
    .eq("room", room)
    .maybeSingle();

  if (!studyClass) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Signed-in visitors get their own planner and course; guests just join the call.
  let tasks: StudyTask[] = [];
  let course: CourseItem[] = [];
  if (user) {
    const [{ data: t }, { data: c }] = await Promise.all([
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
    tasks = (t as StudyTask[]) ?? [];
    course = (c as CourseItem[]) ?? [];
  }

  const displayName =
    (user?.user_metadata?.name as string | undefined) || user?.email?.split("@")[0] || undefined;

  return (
    <ClassRoom
      studyClass={studyClass as StudyClass}
      initialTasks={tasks}
      initialCourse={course}
      canSave={!!user}
      displayName={displayName}
    />
  );
}
