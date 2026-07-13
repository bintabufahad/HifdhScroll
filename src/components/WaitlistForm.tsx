"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function WaitlistForm() {
  const searchParams = useSearchParams();
  const cameFromExpiredTrial = searchParams.get("from") === "trial-ended";
  const cameFromAuthError = searchParams.get("from") === "auth-error";
  const nextParam = searchParams.get("next");

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

    const supabase = createClient();
    const safeNext = nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/";
    const redirectUrl = new URL(`${window.location.origin}/auth/callback`);
    if (safeNext !== "/") {
      redirectUrl.searchParams.set("next", safeNext);
    }

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl.toString(),
        data: {
          name: name.trim() || undefined,
          suggestion: suggestion.trim() || undefined,
        },
      },
    });

    if (signInError) {
      setError(signInError.message || "Something went wrong. Please try again.");
      setSubmitting(false);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 text-center">
        <h2 className="font-display text-2xl font-bold text-[#3b2a1a]">Check your email</h2>
        <p className="text-[#5a4530]">
          We sent a sign-in link to <strong>{email}</strong>. Open it to activate your 14-day free trial.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-md flex-col gap-4">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold text-[#3b2a1a]">Join the waitlist</h1>
        <p className="mt-2 text-[#5a4530]">Sign up for instant access: a 14-day free trial of HifdhScroll.</p>
      </div>

      {cameFromExpiredTrial && (
        <p className="rounded-lg border border-[#c9a15d]/40 bg-[#f5ecd7] px-4 py-3 text-sm text-[#5a4530]">
          Your free trial has ended. Join below to hear about what&apos;s next.
        </p>
      )}
      {cameFromAuthError && (
        <p className="rounded-lg border border-red-800/30 bg-red-50 px-4 py-3 text-sm text-red-900">
          That sign-in link didn&apos;t work (it may have expired). Please request a new one below.
        </p>
      )}

      <input
        type="text"
        placeholder="Name (optional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="rounded-lg border border-[#c9a15d]/50 bg-[#faf3e2] px-4 py-3 text-[#3b2a1a] outline-none focus:ring-2 focus:ring-[#b8935a]"
      />
      <input
        type="email"
        required
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-lg border border-[#c9a15d]/50 bg-[#faf3e2] px-4 py-3 text-[#3b2a1a] outline-none focus:ring-2 focus:ring-[#b8935a]"
      />
      <textarea
        placeholder="Any suggestions or feedback? (optional)"
        value={suggestion}
        onChange={(e) => setSuggestion(e.target.value)}
        rows={3}
        className="rounded-lg border border-[#c9a15d]/50 bg-[#faf3e2] px-4 py-3 text-[#3b2a1a] outline-none focus:ring-2 focus:ring-[#b8935a]"
      />

      {error && <p className="text-sm text-red-800">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-[#7a2e2e] py-3 font-display font-semibold text-[#f5ecd7] hover:bg-[#8a3a3a] disabled:opacity-60"
      >
        {submitting ? "Sending…" : "Email me a sign-in link"}
      </button>
    </form>
  );
}
