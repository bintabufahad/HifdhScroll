import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Handles the magic-link redirect. Supports two flows:
 *
 * 1. token_hash + type (verifyOtp) - stateless, so it works even when the
 *    email link is opened in a different browser/app than the one that
 *    requested it (e.g. tapping the link from a mail app's in-app browser).
 *    This is the robust path and the one the email template should use.
 * 2. code (exchangeCodeForSession, PKCE) - kept as a fallback; requires the
 *    code-verifier cookie set at sign-in time, so it only works in the same
 *    browser session.
 *
 * `next` lets a sign-in that started from a gated page (e.g. /study) send the
 * user back to that page after authenticating, instead of always to home.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  const supabase = await createClient();

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/waitlist?from=auth-error`);
}

/** Only allow same-site relative paths, so `next` can't be used as an open redirect. */
function safeNext(value: string | null): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return "/";
}
