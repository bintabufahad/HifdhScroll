import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Everything is free now - there's no trial. /reel and /study just require a
 * signed-in user; if there's none, send them to the sign-in page and remember
 * where they were headed. /feedback (the reviews page) is public.
 *
 * Exception: a class join link (/study/class/<room>) is public so anyone can
 * join a group-study call from a shared link without having to sign in first.
 */
export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  const isPublicClassJoin = request.nextUrl.pathname.startsWith("/study/class/");

  if (!user && !isPublicClassJoin) {
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
