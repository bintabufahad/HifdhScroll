"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { getAudioUrlCandidates } from "@/lib/audio";
import { getQari } from "@/lib/qaris";
import type { Feeling } from "@/lib/feelings";
import type { Ayah } from "@/lib/types";

/** Converts a number to Arabic-Indic digits (e.g. 255 -> ٢٥٥). */
function toArabicNumerals(n: number): string {
  return String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
}

/**
 * One feeling's collection: a calm scroll of ayah cards. Each card can play its
 * recitation and be gifted straight to someone who needs it (the gift composer
 * opens prefilled with that ayah - this is where the emotional mushaf and the
 * Send-an-Ayah feature meet).
 */
export default function FeelingViewer({ feeling, groups }: { feeling: Feeling; groups: Ayah[][] }) {
  return (
    <div className="bg-app-dark flex min-h-[100dvh] flex-col items-center px-5 py-8">
      <div className="w-full max-w-xl">
        <div className="mb-5 flex items-center gap-3">
          <Link
            href="/feel"
            className="lift inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500 px-4 py-1.5 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
          >
            ← Feelings
          </Link>
        </div>

        <header className="animate-rise-in mb-6 text-center">
          <span className="text-3xl">{feeling.emoji}</span>
          <h1 className="mt-2 font-display text-xl font-bold text-white sm:text-3xl">
            When you feel <span className="text-emerald-300">{feeling.label.toLowerCase()}</span>
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm italic text-white/55">{feeling.line}</p>
        </header>

        {groups.length === 0 ? (
          <p className="text-center text-sm text-white/50">
            Couldn&apos;t load the ayahs right now — please try again in a moment.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {groups.map((ayahs, i) => (
              <AyahCard key={`${ayahs[0].surahNumber}:${ayahs[0].numberInSurah}`} ayahs={ayahs} index={i} />
            ))}
          </div>
        )}

        <p className="mt-8 text-center text-xs text-white/45">
          Someone you know is feeling this too.{" "}
          <Link href="/gift/new" className="text-emerald-300 underline underline-offset-2 hover:text-emerald-200">
            Send them an ayah 🎁
          </Link>
        </p>
      </div>
    </div>
  );
}

function AyahCard({ ayahs, index }: { ayahs: Ayah[]; index: number }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const [candidateIndex, setCandidateIndex] = useState(0);

  const first = ayahs[0];
  const last = ayahs[ayahs.length - 1];
  const refLabel =
    ayahs.length > 1
      ? `${first.surahName} · ${first.surahNumber}:${first.numberInSurah}–${last.numberInSurah}`
      : `${first.surahName} · ${first.surahNumber}:${first.numberInSurah}`;

  const qari = getQari("alafasy")!;

  function playFrom(idx: number) {
    const audio = audioRef.current;
    if (!audio) return;
    if (playingIdx !== null) {
      audio.pause();
      setPlayingIdx(null);
      return;
    }
    const a = ayahs[idx];
    const candidates = getAudioUrlCandidates(qari, a.surahNumber, a.numberInSurah);
    audio.src = candidates[Math.min(candidateIndex, candidates.length - 1)];
    audio
      .play()
      .then(() => setPlayingIdx(idx))
      .catch(() => setCandidateIndex((c) => Math.min(c + 1, candidates.length - 1)));
  }

  function onEnded() {
    // Play through a short range; stop after the last ayah.
    const next = playingIdx !== null ? playingIdx + 1 : null;
    setPlayingIdx(null);
    if (next !== null && next < ayahs.length) {
      const a = ayahs[next];
      const audio = audioRef.current;
      if (!audio) return;
      const candidates = getAudioUrlCandidates(qari, a.surahNumber, a.numberInSurah);
      audio.src = candidates[0];
      audio
        .play()
        .then(() => setPlayingIdx(next))
        .catch(() => {});
    }
  }

  return (
    <div
      className="animate-rise-in glass rounded-2xl p-5 sm:p-6"
      style={{ animationDelay: `${Math.min(index * 90, 450)}ms` }}
    >
      {ayahs.map((a) => (
        <div key={a.numberInSurah} className="mb-3 last:mb-0">
          {a.bismillah && (
            <p dir="rtl" className="font-arabic mb-2 text-base leading-[2] text-amber-100/80">
              {a.bismillah}
            </p>
          )}
          <p dir="rtl" className="font-arabic pt-1 text-xl leading-[2.3] text-white sm:text-2xl">
            {a.arabic}
            <span className="text-amber-200"> ﴿{toArabicNumerals(a.numberInSurah)}﴾</span>
          </p>
          <p className="mt-2 text-sm leading-relaxed text-white/75">{a.translation}</p>
        </div>
      ))}

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/10 pt-3">
        <span className="min-w-0 truncate text-xs font-medium text-emerald-200/80">{refLabel}</span>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => playFrom(0)}
            className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/85 transition hover:bg-white/20"
          >
            {playingIdx !== null ? "⏸" : "▶"} Recite
          </button>
          <Link
            href={`/gift/new?s=${first.surahNumber}&a=${first.numberInSurah}`}
            className="rounded-full bg-emerald-500/90 px-3 py-1.5 text-xs font-semibold text-emerald-950 transition hover:bg-emerald-400"
          >
            🎁 Send
          </Link>
        </div>
      </div>

      <audio ref={audioRef} onEnded={onEnded} onError={() => setPlayingIdx(null)} className="hidden" />
    </div>
  );
}
