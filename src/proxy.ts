import { NextResponse, type NextRequest } from "next/server";
import { decodeTrialCookie, isTrialActive, TRIAL_COOKIE_NAME } from "@/lib/trialCookie";

export function proxy(request: NextRequest) {
  const payload = decodeTrialCookie(request.cookies.get(TRIAL_COOKIE_NAME)?.value);
  if (!isTrialActive(payload)) {
    const url = request.nextUrl.clone();
    url.pathname = "/waitlist";
    url.search = "";
    url.searchParams.set("from", "trial");
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/reel/:path*"],
};
