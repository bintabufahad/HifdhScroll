import { createClient } from "@/lib/supabase/server";
import ReviewsPage from "@/components/ReviewsPage";
import type { Review } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function FeedbackPage() {
  const supabase = await createClient();

  const [{ data: reviews }, { data: userData }] = await Promise.all([
    supabase.from("reviews").select("id, author_name, rating, body, created_at, user_id").order("created_at", {
      ascending: false,
    }),
    supabase.auth.getUser(),
  ]);

  const user = userData?.user ?? null;
  const defaultName =
    (user?.user_metadata?.name as string | undefined) || user?.email?.split("@")[0] || "";

  return (
    <ReviewsPage
      initialReviews={(reviews as Review[]) ?? []}
      signedIn={!!user}
      currentUserId={user?.id ?? null}
      defaultName={defaultName}
    />
  );
}
