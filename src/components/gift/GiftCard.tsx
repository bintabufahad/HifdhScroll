"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import SceneBackground from "@/components/SceneBackground";
import { getAudioUrlCandidates } from "@/lib/audio";
import { getQari } from "@/lib/qaris";
import type { Ayah } from "@/lib/types";

/** Converts a number to Arabic-Indic digits (e.g. 255 -> ٢٥٥). */
function toArabicNumerals(n: number): string {
  return String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
}

/**
 * The opened gift: an ayah presented like a reel - scenery, Arabic, translation,
 * the sender's note - with recitation on tap. Ends in a gentle CTA, since this
 * page is how many recipients first meet Rusookh.
 */
export default function GiftCard({
  ayah,
  to,
  from,
  note,
  sceneId,
}: {
  ayah: Ayah;
  to: string;
  from: string;
  note: string;
  sceneId: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const qari = getQari("alafasy")!;
  const candidates = getAudioUrlCandidates(qari, ayah.surahNumber, ayah.numberInSurah);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    if (!audio.src || audio.error) {
      audio.src = candidates[Math.min(candidateIndex, candidates.length - 1)];
    }
    audio.play().then(() => setPlaying(true)).catch(() => setCandidateIndex((c) => Math.min(c + 1, candidates.length - 1)));
  }

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-black px-5 py-10">
      <audio
        ref={audioRef}
        onEnded={() => setPlaying(false)}
        onError={() => setCandidateIndex((c) => Math.min(c + 1, candidates.length - 1))}
        className="hidden"
      />
      <div className="absolute inset-0">
        <SceneBackground sceneId={sceneId} />
        <div className="absolute inset-0 bg-black/45" />
      </div>

      <div className="animate-rise-in relative z-10 flex w-full max-w-lg flex-col items-center gap-4 text-center">
        {to && (
          <p className="text-sm text-amber-100/90">
            A gift for <strong className="font-display text-amber-200">{to}</strong> 🎁
          </p>
        )}

        <div className="w-full rounded-2xl border border-amber-200/40 bg-black/40 px-5 py-6 backdrop-blur-sm sm:px-8">
          {ayah.bismillah && (
            <p dir="rtl" className="font-arabic mb-3 text-lg leading-[2] text-amber-100/90">
              {ayah.bismillah}
            </p>
          )}
          <p dir="rtl" className="font-arabic pt-1 text-2xl leading-[2.3] text-white drop-shadow-lg sm:text-3xl">
            {ayah.arabic}
            <span className="text-amber-200"> ﴿{toArabicNumerals(ayah.numberInSurah)}﴾</span>
          </p>
          <p className="mt-4 text-sm leading-relaxed text-white/85 sm:text-base">{ayah.translation}</p>
          <p className="mt-3 text-xs font-medium text-amber-100/80">
            {ayah.surahName} · {ayah.surahNumber}:{ayah.numberInSurah}
          </p>
        </div>

        <button
          type="button"
          onClick={togglePlay}
          className="lift rounded-full bg-white/12 px-5 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20"
        >
          {playing ? "⏸ Pause recitation" : "▶ Play recitation"}
        </button>

        {note && (
          <p className="max-w-md rounded-xl bg-black/35 px-4 py-3 text-sm italic leading-relaxed text-white/90 backdrop-blur-sm">
            “{note}”
          </p>
        )}
        {from && <p className="text-sm text-white/70">— {from}</p>}

        <div className="mt-4 flex flex-col items-center gap-1.5">
          <Link
            href="/gift/new"
            className="lift rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
          >
            🎁 Send someone an ayah
          </Link>
          <Link href="/" className="text-xs text-white/55 underline underline-offset-2 hover:text-white/80">
            made with Rusookh — your companion for the Qur&apos;an
          </Link>
        </div>
      </div>
    </div>
  );
}
