import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user, supabase } = await updateSession(request);

  if (!user) {
    return redirectToWaitlist(request);
  }

  const { data: profile } = await supabase.from("profiles").select("trial_ends_at").eq("id", user.id).single();

  const trialEndsAt = profile?.trial_ends_at ? new Date(profile.trial_ends_at).getTime() : 0;
  if (trialEndsAt <= Date.now()) {
    return redirectToWaitlist(request);
  }

  return supabaseResponse;
}

function redirectToWaitlist(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/waitlist";
  url.search = "";
  url.searchParams.set("from", "trial");
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/reel/:path*"],
};
