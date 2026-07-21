import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ClassRoom from "@/components/study/ClassRoom";
import type { CourseItem, StudyClass, StudyTask } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ClassRoomPage({ params }: { params: Promise<{ room: string }> }) {
  const { room } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The proxy already requires a signed-in user for /study/class/*.
  if (!user) {
    return null;
  }

  const { data: studyClass } = await supabase
    .from("classes")
    .select("id, owner_id, name, room, created_at")
    .eq("room", room)
    .maybeSingle();

  if (!studyClass) {
    notFound();
  }

  // Each member has their own course + to-dos within this class.
  const classId = (studyClass as StudyClass).id;
  const [{ data: tasks }, { data: course }] = await Promise.all([
    supabase
      .from("study_tasks")
      .select("id, title, is_done, created_at, completed_at")
      .eq("user_id", user.id)
      .eq("class_id", classId)
      .order("created_at", { ascending: true }),
    supabase
      .from("course_items")
      .select("id, type, url, title, done, position")
      .eq("user_id", user.id)
      .eq("class_id", classId)
      .order("position", { ascending: true }),
  ]);

  const displayName =
    (user.user_metadata?.name as string | undefined) || user.email?.split("@")[0] || undefined;

  return (
    <ClassRoom
      studyClass={studyClass as StudyClass}
      initialTasks={(tasks as StudyTask[]) ?? []}
      initialCourse={(course as CourseItem[]) ?? []}
      displayName={displayName}
    />
  );
}
