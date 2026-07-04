"use client";

import { useEffect, useRef, useState } from "react";
import SceneBackground from "@/components/SceneBackground";
import { getAudioUrlCandidates, estimateReadDurationMs } from "@/lib/audio";
import type { ReelSegment } from "@/lib/types";

export default function ReelPlayer({ segment, isActive }: { segment: ReelSegment; isActive: boolean }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [candidateIndex, setCandidateIndex] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ayahs = segment.ayahs;
  const current = ayahs[index];
  const done = index >= ayahs.length;

  function goNextAyah() {
    setCandidateIndex(0);
    setIndex((i) => i + 1);
  }

  function restart() {
    setCandidateIndex(0);
    setIndex(0);
    setPlaying(true);
  }

  // Pause and stop timers the moment this reel scrolls out of view.
  useEffect(() => {
    if (!isActive) {
      audioRef.current?.pause();
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  }, [isActive]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!current || done || !isActive) return;

    const candidates = getAudioUrlCandidates(segment.qari, current.surahNumber, current.numberInSurah);
    const url = candidates[candidateIndex];
    const audio = audioRef.current;

    if (url && audio) {
      audio.src = url;
      if (playing) audio.play().catch(() => setCandidateIndex((c) => c + 1));
      return;
    }

    // Every audio candidate failed (or this reciter has none yet): pace by reading time instead.
    if (playing) {
      const timingText = `${current.bismillah ?? ""} ${current.arabic}`;
      timerRef.current = setTimeout(goNextAyah, estimateReadDurationMs(timingText));
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, segment, playing, candidateIndex, isActive]);

  function togglePlay() {
    setPlaying((p) => {
      const next = !p;
      const audio = audioRef.current;
      if (audio && audio.src) {
        if (next) audio.play().catch(() => setCandidateIndex((c) => c + 1));
        else audio.pause();
      }
      return next;
    });
  }

  return (
    <div className="relative mx-auto flex h-full w-full flex-col overflow-hidden bg-black sm:max-w-[480px] sm:rounded-2xl sm:border-4 sm:border-[#c9a15d]/70 sm:shadow-2xl">
      <audio
        ref={audioRef}
        onEnded={goNextAyah}
        onError={() => setCandidateIndex((c) => c + 1)}
        className="hidden"
      />

      <div className="absolute inset-0">
        <SceneBackground sceneId={segment.sceneId} />
        <div className="absolute inset-0 bg-black/35" />
      </div>

      <div className="relative z-10 shrink-0 px-4 pt-4">
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full bg-amber-300 transition-all"
            style={{ width: `${Math.min(100, (index / ayahs.length) * 100)}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-white/70">
          {segment.qari.name} · {segment.qari.style}
        </p>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={togglePlay}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && togglePlay()}
        className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-4 text-center"
      >
        {done ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-black/50 p-6">
            <p className="font-display text-xl font-semibold text-white">Reel complete</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                restart();
              }}
              className="rounded-full bg-amber-400 px-5 py-2 text-[#3b2a1a] font-medium"
            >
              Replay
            </button>
          </div>
        ) : (
          current && (
            <div
              key={index}
              className="flex max-h-full flex-col items-center gap-3 overflow-y-auto"
              style={{ animation: "rise 0.45s ease" }}
            >
              {current.bismillah && (
                <div className="rounded-xl border border-amber-200/60 bg-black/35 px-4 py-2">
                  <p dir="rtl" className="font-arabic text-xl leading-relaxed text-amber-100 sm:text-2xl">
                    {current.bismillah}
                  </p>
                </div>
              )}
              {current.arabic && (
                <p dir="rtl" className="font-arabic text-2xl leading-[1.8] text-white drop-shadow-lg sm:text-3xl">
                  {current.arabic}
                </p>
              )}
              <p className="max-w-md text-sm text-white/85 drop-shadow sm:text-base">{current.translation}</p>
              {!playing && <span className="text-xs text-white/60">Paused — tap to resume</span>}
            </div>
          )
        )}
      </div>
    </div>
  );
}
