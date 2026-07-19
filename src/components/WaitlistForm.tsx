"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
    return "Please wait a few seconds, then try again — the server limits how often codes can be sent.";
  }
  if (m.toLowerCase().includes("expired") || m.toLowerCase().includes("invalid")) {
    return "That code is wrong or expired. Check the newest email and re-enter the 6-digit code.";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const cameFromAuthError = searchParams.get("from") === "auth-error";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  // Code-verification step (works in any browser - the key fix for links opened
  // from Instagram's in-app browser vs. the email opening in Chrome).
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);

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
          suggestion: suggestion.trim() || undefined,
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

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    const token = code.replace(/\D/g, "");
    if (token.length < 6) {
      setError("Enter the full code from your email.");
      return;
    }
    setVerifying(true);
    setError("");
    try {
      const supabase = createClient();
      // The same 6-digit code is delivered as a "signup" OTP for brand-new
      // accounts and an "email" (magic-link) OTP for returning ones. We don't
      // know which the person is, so try both types before deciding the code
      // is bad - otherwise a perfectly correct code "always" fails for whichever
      // group we didn't guess.
      let verifyError = null;
      for (const type of ["email", "signup"] as const) {
        const { error } = await supabase.auth.verifyOtp({ email, token, type });
        if (!error) {
          verifyError = null;
          break;
        }
        verifyError = error;
      }
      if (verifyError) {
        console.error("verifyOtp error:", verifyError);
        setError(friendlyError(verifyError.message));
        setVerifying(false);
        return;
      }
      // Session is now set in THIS browser. Go home, signed in.
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("verifyOtp threw:", err);
      setError(friendlyError(err instanceof Error ? err.message : String(err)));
      setVerifying(false);
    }
  }

  if (sent) {
    return (
      <form onSubmit={verifyCode} className="glass mx-auto flex w-full max-w-md flex-col gap-4 rounded-2xl p-6 text-center">
        <h2 className="font-display text-2xl font-bold text-white">Check your email</h2>
        <p className="text-sm text-white/70">
          We sent a code to <strong className="text-emerald-300">{email}</strong>. Enter it below to sign in —
          it works right here, no need to switch apps.
        </p>

        <input
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={10}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="Enter the code"
          className="rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-center text-2xl tracking-[0.4em] text-white outline-none placeholder:tracking-normal placeholder:text-base placeholder:text-white/40 focus:ring-2 focus:ring-emerald-500/50"
        />

        {error && <p className="text-sm text-red-300">{error}</p>}

        <button
          type="submit"
          disabled={verifying}
          className="lift w-full rounded-full bg-emerald-500 py-3 font-display font-semibold text-emerald-950 hover:bg-emerald-400 disabled:opacity-60"
        >
          {verifying ? "Signing in…" : "Verify & sign in"}
        </button>

        <p className="text-xs text-white/45">
          (You can also just tap the link in the email — but the code is the most reliable way.)
        </p>
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setCode("");
            setError("");
          }}
          className="text-xs text-emerald-300 underline underline-offset-2 hover:text-emerald-200"
        >
          Use a different email
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass mx-auto flex w-full max-w-md flex-col gap-4 rounded-2xl p-6">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold text-white">Sign in to Rusookh</h1>
        <p className="mt-2 text-white/60">Enter your email — we&apos;ll send you a code. It&apos;s completely free.</p>
      </div>

      {cameFromAuthError && (
        <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          That sign-in link didn&apos;t work. Enter your email below and use the <strong>code</strong> instead
          — it always works.
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
        {submitting ? "Sending…" : "Email me a code"}
      </button>
    </form>
  );
}
