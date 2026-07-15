"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function isNetworkError(message: string): boolean {
  const m = message.toLowerCase();
  return m.includes("failed to fetch") || m.includes("networkerror") || m.includes("load failed");
}

function friendlyError(message: string): string {
  const m = (message || "").trim();
  if (isNetworkError(m)) {
    return "Couldn't reach the server. Check your internet connection and try again. If it keeps failing, the app's database may be waking up — wait a minute and retry.";
  }
  if (m.toLowerCase().includes("rate limit")) {
    return "Too many attempts for now. Please wait a little while, then request the link again.";
  }
  // Opaque/empty server errors (e.g. "{}", "[object Object]", or a database
  // error during signup) - give something actionable instead of the raw blob.
  if (m === "" || m === "{}" || m === "[object Object]" || m.toLowerCase().includes("database error")) {
    return "The server couldn't complete sign-in right now — this is usually a temporary issue on the app's side. Please wait a minute and try again.";
  }
  return m;
}

export default function WaitlistForm() {
  const searchParams = useSearchParams();
  const cameFromExpiredTrial = searchParams.get("from") === "trial-ended";
  const cameFromAuthError = searchParams.get("from") === "auth-error";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    // Keep the redirect URL free of query params: Supabase appends its own
    // auth code to this URL, and an existing query string can collide with it
    // and break the code exchange. The user lands on the home hub after
    // sign-in, which is fine.
    const options = {
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          name: name.trim() || undefined,
          suggestion: suggestion.trim() || undefined,
        },
      },
    };

    // A transient "Failed to fetch" (flaky mobile network, or the free Supabase
    // project waking up) often clears on a second try, so retry network errors
    // once before surfacing the error.
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const supabase = createClient();
        const { error: signInError } = await supabase.auth.signInWithOtp(options);
        if (!signInError) {
          setSent(true);
          return;
        }
        // Log the full error so the real cause is visible in the browser console.
        console.error("Sign-in error:", signInError);
        if (isNetworkError(signInError.message) && attempt === 0) {
          await new Promise((r) => setTimeout(r, 1200));
          continue;
        }
        setError(friendlyError(signInError.message));
        setSubmitting(false);
        return;
      } catch (err) {
        console.error("Sign-in threw:", err);
        const message = err instanceof Error ? err.message : String(err);
        if (isNetworkError(message) && attempt === 0) {
          await new Promise((r) => setTimeout(r, 1200));
          continue;
        }
        setError(friendlyError(message));
        setSubmitting(false);
        return;
      }
    }
  }

  if (sent) {
    return (
      <div className="glass mx-auto flex w-full max-w-md flex-col items-center gap-4 rounded-2xl p-6 text-center">
        <h2 className="font-display text-2xl font-bold text-white">Check your email</h2>
        <p className="text-white/70">
          We sent a sign-in link to <strong className="text-emerald-300">{email}</strong>. Open it to activate your
          14-day free trial.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass mx-auto flex w-full max-w-md flex-col gap-4 rounded-2xl p-6">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold text-white">Join the waitlist</h1>
        <p className="mt-2 text-white/60">Sign up for instant access: a 14-day free trial of HifdhScroll.</p>
      </div>

      {cameFromExpiredTrial && (
        <p className="rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          Your free trial has ended. Join below to hear about what&apos;s next.
        </p>
      )}
      {cameFromAuthError && (
        <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          That sign-in link didn&apos;t work (it may have expired). Please request a new one below.
        </p>
      )}

      <input
        type="text"
        placeholder="Name (optional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/40 focus:ring-2 focus:ring-emerald-500/50"
      />
      <input
        type="email"
        required
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/40 focus:ring-2 focus:ring-emerald-500/50"
      />
      <textarea
        placeholder="Any suggestions or feedback? (optional)"
        value={suggestion}
        onChange={(e) => setSuggestion(e.target.value)}
        rows={3}
        className="rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/40 focus:ring-2 focus:ring-emerald-500/50"
      />

      {error && <p className="text-sm text-red-300">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="lift w-full rounded-full bg-emerald-500 py-3 font-display font-semibold text-emerald-950 hover:bg-emerald-400 disabled:opacity-60"
      >
        {submitting ? "Sending…" : "Email me a sign-in link"}
      </button>
    </form>
  );
}
