"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { surahs, getSurah } from "@/lib/surahs";
import { randomSceneId } from "@/lib/scenes";

/**
 * Compose an ayah gift: pick the ayah, add a note, get a link to send. The gift
 * lives entirely in the link (no storage) - simple, private, and permanent.
 * Arriving from a feelings collection prefills that ayah (?s=&a=).
 */
export default function GiftComposer() {
  const searchParams = useSearchParams();
  const prefillSurah = Number(searchParams.get("s"));
  const prefillAyah = Number(searchParams.get("a"));
  const validPrefill = !!getSurah(prefillSurah);

  const [surahNumber, setSurahNumber] = useState(validPrefill ? prefillSurah : 2);
  const [ayahNumber, setAyahNumber] = useState(
    validPrefill && prefillAyah >= 1 ? Math.min(prefillAyah, getSurah(prefillSurah)!.ayahCount) : 255
  );
  const [to, setTo] = useState("");
  const [from, setFrom] = useState("");
  const [note, setNote] = useState("");
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);

  const surah = getSurah(surahNumber);
  const maxAyah = surah?.ayahCount ?? 286;

  function buildLink(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("s", String(surahNumber));
    params.set("a", String(Math.min(Math.max(1, ayahNumber), maxAyah)));
    if (to.trim()) params.set("to", to.trim());
    if (from.trim()) params.set("from", from.trim());
    if (note.trim()) params.set("note", note.trim());
    params.set("scene", randomSceneId());
    setLink(`${window.location.origin}/gift?${params.toString()}`);
    setCopied(false);
  }

  async function shareLink() {
    try {
      if (navigator.share) {
        await navigator.share({ title: "An ayah for you 🎁", url: link });
        return;
      }
    } catch {
      /* dismissed - fall through to copy */
    }
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* the link is visible below - they can long-press it */
    }
  }

  return (
    <div className="bg-app-dark flex min-h-[100dvh] flex-col items-center px-5 py-8">
      <div className="w-full max-w-md">
        <div className="mb-5 flex items-center gap-3">
          <Link
            href="/"
            className="lift inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500 px-4 py-1.5 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
          >
            ← Home
          </Link>
          <h1 className="font-display text-xl font-bold text-white sm:text-2xl">
            Send an <span className="text-emerald-300">ayah</span> 🎁
          </h1>
        </div>

        <form onSubmit={buildLink} className="glass flex flex-col gap-3 rounded-2xl p-4 sm:p-5">
          <div className="flex gap-2">
            <label className="flex min-w-0 flex-[2] flex-col gap-1 text-xs text-white/60">
              Surah
              <select
                value={surahNumber}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  setSurahNumber(n);
                  setAyahNumber((a) => Math.min(a, getSurah(n)?.ayahCount ?? 1));
                }}
                className="rounded-lg border border-white/15 bg-white/5 px-2 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-500/50 [&>option]:bg-[#0c1512]"
              >
                {surahs.map((s) => (
                  <option key={s.number} value={s.number}>
                    {s.number}. {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs text-white/60">
              Ayah (1–{maxAyah})
              <input
                type="number"
                min={1}
                max={maxAyah}
                value={ayahNumber}
                onChange={(e) => setAyahNumber(Number(e.target.value))}
                className="rounded-lg border border-white/15 bg-white/5 px-2 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </label>
          </div>

          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            maxLength={60}
            placeholder="Their name (optional)"
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:ring-2 focus:ring-emerald-500/50"
          />
          <input
            type="text"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            maxLength={60}
            placeholder="Your name (optional)"
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:ring-2 focus:ring-emerald-500/50"
          />
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={300}
            rows={3}
            placeholder="A short personal note (optional) — e.g. “This ayah carried me through a hard week. May it comfort you too.”"
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:ring-2 focus:ring-emerald-500/50"
          />

          <button
            type="submit"
            className="lift rounded-full bg-emerald-500 py-2.5 font-display font-semibold text-emerald-950 transition hover:bg-emerald-400"
          >
            Create gift link
          </button>
        </form>

        {link && (
          <div className="animate-rise-in glass mt-4 flex flex-col gap-3 rounded-2xl p-4">
            <p className="break-all rounded-lg bg-black/30 px-3 py-2 text-xs text-emerald-200/90">{link}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={shareLink}
                className="lift flex-1 rounded-full bg-emerald-500 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
              >
                {copied ? "✓ Copied" : "Share the gift"}
              </button>
              <a
                href={link}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
              >
                Preview
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
