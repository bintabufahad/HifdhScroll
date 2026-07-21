import { createClient } from "@/lib/supabase/server";
import StudyHub from "@/components/study/StudyHub";
import type { StudyClass } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function StudyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The proxy already redirects signed-out visitors away from /study.
  if (!user) {
    return null;
  }

  const { data: classes } = await supabase
    .from("classes")
    .select("id, owner_id, name, room, created_at")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return <StudyHub initialClasses={(classes as StudyClass[]) ?? []} />;
}
