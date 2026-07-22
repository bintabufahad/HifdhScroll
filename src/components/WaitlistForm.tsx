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
    return "Couldn't reach the server. Check your connection and try again in a moment.";
  }
  if (m.toLowerCase().includes("rate limit") || m.toLowerCase().includes("after")) {
    return "Please wait a few seconds, then try again — the server limits how often links can be sent.";
  }
  if (m.toLowerCase().includes("sending") || m.toLowerCase().includes("smtp")) {
    return "We couldn't send the email right now. Please try again in a moment.";
  }
  if (m.toLowerCase().includes("database error")) {
    return "Sign-up error (database). Please try again shortly.";
  }
  if (m === "" || m === "{}" || m === "[object Object]") {
    return "The server had a hiccup — please wait a moment and try again.";
  }
  return m;
}

export default function WaitlistForm() {
  const searchParams = useSearchParams();
  const cameFromAuthError = searchParams.get("from") === "auth-error";

  const [name, setName] = useState("");
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const options = {
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          name: name.trim() || undefined,
        },
      },
    };

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const supabase = createClient();
        const { error: signInError } = await supabase.auth.signInWithOtp(options);
        if (!signInError) {
          setSent(true);
          setSubmitting(false);
          return;
        }
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
      <div className="glass mx-auto flex w-full max-w-md flex-col gap-4 rounded-2xl p-6 text-center">
        <h2 className="font-display text-2xl font-bold text-white">Check your email</h2>
        <p className="text-sm text-white/70">
          We sent a sign-in link to <strong className="text-emerald-300">{email}</strong>. Open the email and tap
          <strong className="text-white"> “Sign in to Rusookh”</strong> — that&apos;s it, you&apos;ll be signed in.
        </p>
        <p className="text-xs text-white/45">
          Can&apos;t find it? Check your spam folder. The link can take a minute to arrive.
        </p>
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setError("");
          }}
          className="text-xs text-emerald-300 underline underline-offset-2 hover:text-emerald-200"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass mx-auto flex w-full max-w-md flex-col gap-4 rounded-2xl p-6">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold text-white">Sign in to Rusookh</h1>
        <p className="mt-2 text-white/60">Enter your email — we&apos;ll send you a sign-in link. It&apos;s completely free.</p>
      </div>

      {cameFromAuthError && (
        <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          That sign-in link didn&apos;t work — it may have already been used or expired. Enter your email below to get a
          fresh one.
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
