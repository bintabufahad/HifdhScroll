import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";

/**
 * Handles the magic-link redirect. Supports two flows:
 *
 * 1. token_hash + type (verifyOtp) - stateless, works even when the link is
 *    opened in a different browser/app than the one that requested it.
 * 2. code (exchangeCodeForSession, PKCE) - requires the code-verifier cookie
 *    set at sign-in time, so it only works in the same browser.
 *
 * Crucially, the Supabase client here writes the resulting session cookies
 * directly onto the redirect Response we return. Relying on the next/headers
 * cookie store doesn't reliably attach cookies to a hand-built redirect, which
 * caused the "signed in for a moment, then bounced back to sign-up" loop.
 *
 * `next` lets a sign-in that started from a gated page (e.g. /study) return
 * there afterwards instead of always going home.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  const response = NextResponse.redirect(`${origin}${next}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.headers.get("cookie") ? parseCookieHeader(request.headers.get("cookie")!) : [];
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) return response;
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return response;
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

/** Minimal Cookie header parser -> { name, value }[] for the Supabase cookie adapter. */
function parseCookieHeader(header: string): { name: string; value: string }[] {
  return header
    .split(";")
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const eq = pair.indexOf("=");
      const name = eq === -1 ? pair : pair.slice(0, eq);
      const value = eq === -1 ? "" : decodeURIComponent(pair.slice(eq + 1));
      return { name, value };
    });
}
