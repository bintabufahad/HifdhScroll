"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Review } from "@/lib/types";
import { useLanguage } from "@/lib/i18n";

function Stars({ value }: { value: number | null }) {
  const n = value ?? 0;
  return (
    <span className="text-amber-300" aria-label={`${n} out of 5`}>
      {"★".repeat(n)}
      <span className="text-white/20">{"★".repeat(5 - n)}</span>
    </span>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export default function ReviewsPage({
  initialReviews,
  signedIn,
  currentUserId,
  defaultName,
}: {
  initialReviews: Review[];
  signedIn: boolean;
  currentUserId: string | null;
  defaultName: string;
}) {
  const { t, dir } = useLanguage();
  const [reviews, setReviews] = useState(initialReviews);
  const [rating, setRating] = useState(0);
  const [name, setName] = useState(defaultName);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const alreadyReviewed = !!currentUserId && reviews.some((r) => r.user_id === currentUserId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    setError("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError(t("signInToReview"));
      setSubmitting(false);
      return;
    }

    const { data, error: insErr } = await supabase
      .from("reviews")
      .insert({
        user_id: user.id,
        author_name: name.trim() || null,
        rating: rating || null,
        body: body.trim(),
      })
      .select("id, author_name, rating, body, created_at, user_id")
      .single();

    setSubmitting(false);
    if (insErr || !data) {
      setError(insErr?.message || t("reviewFailed"));
      return;
    }
    setReviews((prev) => [data as Review, ...prev]);
    setBody("");
    setRating(0);
    setDone(true);
  }

  async function deleteOwn(id: string) {
    const supabase = createClient();
    const { error: delErr } = await supabase.from("reviews").delete().eq("id", id);
    if (!delErr) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setDone(false);
    }
  }

  return (
    <div dir={dir} className="bg-app-dark flex flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12">
      <header className="animate-rise-in mx-auto mb-6 w-full max-w-2xl text-center">
        <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
          {t("reviewsTitleA")} <span className="text-emerald-300">{t("reviewsTitleB")}</span>
        </h1>
        <div className="mx-auto mt-2 h-px w-20 bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent" />
        <p className="mx-auto mt-3 max-w-md text-sm text-white/60">
          {t("reviewsSubtitle")}
        </p>
        <div className="mt-4 flex justify-center">
          <Link
            href="/"
            className="lift inline-flex items-center gap-1 rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
          >
            {dir === "rtl" ? "→" : "←"} {t("home")}
          </Link>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        {/* Leave a review */}
        {signedIn ? (
          alreadyReviewed && !done ? (
            <div className="glass rounded-2xl p-4 text-center text-sm text-white/60">
              {t("alreadyReviewed")}
            </div>
          ) : null
        ) : (
          <div className="glass rounded-2xl p-4 text-center text-sm text-white/70">
            <Link href="/waitlist?next=/feedback" className="font-semibold text-emerald-300 underline">
              {t("signInWord")}
            </Link>{" "}
            {t("toLeaveReview")}
          </div>
        )}

        {signedIn && (
          <form onSubmit={handleSubmit} className="glass flex flex-col gap-4 rounded-2xl p-4 sm:p-5">
            <p className="font-display text-lg font-semibold text-white">{t("leaveReview")}</p>

            <div>
              <p className="mb-2 text-sm text-white/70">{t("yourRating")}</p>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    aria-label={`${n} star${n > 1 ? "s" : ""}`}
                    className={`h-9 w-9 rounded-full border text-lg transition ${
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

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("yourName")}
              className="rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/40 focus:ring-2 focus:ring-emerald-500/50"
            />

            <textarea
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder={t("shareExperience")}
              className="rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:ring-2 focus:ring-emerald-500/50"
            />

            {error && <p className="text-sm text-red-300">{error}</p>}
            {done && <p className="text-sm text-emerald-300">{t("reviewPosted")}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="lift self-start rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-emerald-950 hover:bg-emerald-400 disabled:opacity-60"
            >
              {submitting ? t("posting") : t("postReview")}
            </button>
          </form>
        )}

        {/* Reviews list */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium uppercase tracking-widest text-emerald-200/70">
            {reviews.length} {reviews.length === 1 ? t("reviewWord") : t("reviewsWord")}
          </p>
          {reviews.length === 0 ? (
            <p className="glass rounded-2xl p-6 text-center text-sm text-white/50">
              {t("noReviewsYet")}
            </p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="glass rounded-2xl p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-white">{r.author_name?.trim() || t("aStudent")}</span>
                  <span className="text-xs text-white/40">{formatDate(r.created_at)}</span>
                </div>
                {r.rating ? <div className="mt-1 text-sm">
                  <Stars value={r.rating} />
                </div> : null}
                <p className="mt-2 whitespace-pre-wrap text-sm text-white/80">{r.body}</p>
                {r.user_id === currentUserId && (
                  <button
                    type="button"
                    onClick={() => deleteOwn(r.id)}
                    className="mt-2 text-xs text-red-300/70 hover:text-red-300"
                  >
                    {t("deleteMyReview")}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
