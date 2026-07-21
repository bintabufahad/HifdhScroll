import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Everything is free now - there's no trial. /reel and /study just require a
 * signed-in user; if there's none, send them to the sign-in page and remember
 * where they were headed. /feedback (the reviews page) is public.
 *
 * Class join links (/study/class/<room>) also require sign-in, so everyone in a
 * call has a name - the sign-in just carries them straight back to the room.
 */
export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  if (!user) {
    return redirectTo(request, "/waitlist", "signin", request.nextUrl.pathname + request.nextUrl.search);
  }

  return supabaseResponse;
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
  matcher: ["/reel/:path*", "/study/:path*"],
};
