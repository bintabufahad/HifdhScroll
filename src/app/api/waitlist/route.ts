import { NextResponse } from "next/server";
import { upsertSignup } from "@/lib/db";
import { encodeTrialCookie, TRIAL_COOKIE_NAME } from "@/lib/trialCookie";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  let body: { email?: string; name?: string; suggestion?: string; wantsToDonate?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  try {
    const row = await upsertSignup({
      email,
      name: body.name?.trim() || undefined,
      suggestion: body.suggestion?.trim() || undefined,
      wantsToDonate: !!body.wantsToDonate,
    });

    const response = NextResponse.json({ trialEndsAt: row.trial_ends_at });
    response.cookies.set(TRIAL_COOKIE_NAME, encodeTrialCookie({ email: row.email, trialEndsAt: row.trial_ends_at }), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return response;
  } catch (err) {
    console.error("Waitlist signup failed", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
