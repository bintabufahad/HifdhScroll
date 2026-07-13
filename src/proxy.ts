import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user, supabase } = await updateSession(request);
  const path = request.nextUrl.pathname;

  if (!user) {
    // Remember where they were headed so sign-in returns them there.
    return redirectTo(request, "/waitlist", "signin", path + request.nextUrl.search);
  }

  // Study Session dashboard is available to any signed-in user regardless
  // of trial status - it isn't part of the reel-generation trial/feedback
  // gate at all.
  if (path.startsWith("/study")) {
    return supabaseResponse;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("trial_ends_at, feedback_submitted_at")
    .eq("id", user.id)
    .single();

  const trialActive = !!profile?.trial_ends_at && new Date(profile.trial_ends_at).getTime() > Date.now();
  const feedbackDone = !!profile?.feedback_submitted_at;

  if (path.startsWith("/feedback")) {
    // The one-time feedback-for-30-days offer only makes sense once the
    // original trial has actually run out, and only once per account.
    if (trialActive) return NextResponse.redirect(new URL("/", request.url));
    if (feedbackDone) return redirectTo(request, "/waitlist", "trial-ended");
    return supabaseResponse;
  }

  // /reel
  if (trialActive) return supabaseResponse;
  if (!feedbackDone) return redirectTo(request, "/feedback", "trial-ended");
  return redirectTo(request, "/waitlist", "trial-ended");
}

function redirectTo(request: NextRequest, pathname: string, from: string, next?: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  url.searchParams.set("from", from);
  if (next && next.startsWith("/")) {
    url.searchParams.set("next", next);
  }
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/reel/:path*", "/feedback/:path*", "/study/:path*"],
};
