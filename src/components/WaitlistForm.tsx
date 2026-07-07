"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const DONATE_URL = process.env.NEXT_PUBLIC_DONATE_URL;

export default function WaitlistForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cameFromExpiredTrial = searchParams.get("from") === "trial";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [wantsToDonate, setWantsToDonate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, suggestion, wantsToDonate }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setSubmitting(false);
        return;
      }
      setTrialEndsAt(data.trialEndsAt);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  if (trialEndsAt) {
    const endDate = new Date(trialEndsAt).toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 text-center">
        <h2 className="font-display text-2xl font-bold text-[#3b2a1a]">You&apos;re in!</h2>
        <p className="text-[#5a4530]">
          Your 14-day free trial is active until <strong>{endDate}</strong>. Enjoy generating reels.
        </p>
        <button
          onClick={() => router.push("/")}
          className="w-full rounded-full bg-[#7a2e2e] py-3 font-display font-semibold text-[#f5ecd7] hover:bg-[#8a3a3a]"
        >
          Start generating reels
        </button>
        {DONATE_URL && (
          <a
            href={DONATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#7a4a1e] underline underline-offset-2"
          >
            Support HifdhScroll with a donation
          </a>
        )}
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
      <label className="flex items-center gap-2 text-sm text-[#5a4530]">
        <input
          type="checkbox"
          checked={wantsToDonate}
          onChange={(e) => setWantsToDonate(e.target.checked)}
          className="h-4 w-4"
        />
        I&apos;d like to support HifdhScroll with a donation
      </label>

      {error && <p className="text-sm text-red-800">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-[#7a2e2e] py-3 font-display font-semibold text-[#f5ecd7] hover:bg-[#8a3a3a] disabled:opacity-60"
      >
        {submitting ? "Joining…" : "Join & start my free trial"}
      </button>
    </form>
  );
}
