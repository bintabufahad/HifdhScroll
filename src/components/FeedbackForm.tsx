"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import DawahVerses from "@/components/DawahVerses";

export default function FeedbackForm() {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [pricingAnswer, setPricingAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("submit_feedback_and_extend_trial", {
      p_rating: rating || null,
      p_review: review,
      p_pricing_answer: pricingAnswer,
    });

    if (rpcError) {
      setError(rpcError.message || "Something went wrong. Please try again.");
      setSubmitting(false);
      return;
    }

    router.push("/?extended=1");
    router.refresh();
  }

  return (
    <div className="glass mx-auto flex w-full max-w-xl flex-col gap-6 rounded-2xl p-6">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold text-white">Assalamu Alaikum</h1>
        <p className="mt-2 text-white/65">
          Your 14-day trial of Rusookh has come to an end. It has been an honor to have you with us.
        </p>
      </div>

      <DawahVerses />

      <p className="text-white/65">
        Allah (subhanahu wa ta&apos;ala) reminds us of the great virtue in inviting others toward His words. A few
        honest lines from you — sharing what Rusookh meant to your journey — may be exactly the invitation that
        turns someone&apos;s idle minutes on Instagram into a few minutes with the Qur&apos;an instead. We would be
        deeply grateful for your review, and as a token of that gratitude, completing it unlocks{" "}
        <strong className="text-emerald-300">30 additional days</strong> of full access, in shaa Allah.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <p className="mb-2 text-sm font-medium text-white/85">How would you rate your experience?</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
                className={`h-10 w-10 rounded-full border text-lg transition ${
                  rating >= n
                    ? "border-amber-300 bg-amber-300 text-[#0d1512]"
                    : "border-white/20 bg-white/5 text-amber-200/60"
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="review" className="mb-2 block text-sm font-medium text-white/85">
            Would you kindly share a short review of your experience? Your words may help another brother or sister
            discover their own path back to the Qur&apos;an.
          </label>
          <textarea
            id="review"
            required
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/40 focus:ring-2 focus:ring-emerald-500/50"
            placeholder="Share your experience with Rusookh…"
          />
        </div>

        <div>
          <label htmlFor="pricing" className="mb-2 block text-sm font-medium text-white/85">
            As we work to build a sustainable, ad-free Rusookh for the Ummah, we would value your counsel: what
            features or value would make this app worth paying for?
          </label>
          <textarea
            id="pricing"
            required
            value={pricingAnswer}
            onChange={(e) => setPricingAnswer(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/40 focus:ring-2 focus:ring-emerald-500/50"
            placeholder="What would make Rusookh worth paying for?"
          />
        </div>

        {error && <p className="text-sm text-red-300">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="lift w-full rounded-full bg-emerald-500 py-3 font-display font-semibold text-emerald-950 hover:bg-emerald-400 disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit & Unlock 30 More Days"}
        </button>

        <p className="text-center text-xs text-white/45">
          JazakAllah khair for your time and for helping others find their way to the Qur&apos;an.
        </p>
      </form>
    </div>
  );
}
