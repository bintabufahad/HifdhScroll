"use client";

import { useEffect, useRef, useState } from "react";
import SceneBackground from "@/components/SceneBackground";
import { getAudioUrl, estimateReadDurationMs } from "@/lib/audio";
import type { ReelSegment } from "@/lib/types";

export default function ReelPlayer({
  segment,
  reelIndex,
  totalReels,
  onNextReel,
}: {
  segment: ReelSegment;
  reelIndex: number;
  totalReels: number;
  onNextReel: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [audioFailed, setAudioFailed] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ayahs = segment.ayahs;
  const current = ayahs[index];
  const done = index >= ayahs.length;

  function goNextAyah() {
    setAudioFailed(false);
    setIndex((i) => i + 1);
  }
  function goPrevAyah() {
    setAudioFailed(false);
    setIndex((i) => Math.max(0, i - 1));
  }
  function restart() {
    setAudioFailed(false);
    setIndex(0);
    setPlaying(true);
  }

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!current || done) return;

    const url = getAudioUrl(segment.qari, current.surahNumber, current.numberInSurah);
    const audio = audioRef.current;

    if (url && audio && !audioFailed) {
      audio.src = url;
      if (playing) audio.play().catch(() => setAudioFailed(true));
      return;
    }

    if (playing) {
      const timingText = `${current.bismillah ?? ""} ${current.arabic}`;
      timerRef.current = setTimeout(goNextAyah, estimateReadDurationMs(timingText));
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, segment, playing, audioFailed]);

  function togglePlay() {
    setPlaying((p) => {
      const next = !p;
      const audio = audioRef.current;
      if (audio && audio.src) {
        if (next) audio.play().catch(() => setAudioFailed(true));
        else audio.pause();
      }
      return next;
    });
  }

  return (
    <div className="relative mx-auto aspect-[9/16] max-h-[80vh] w-full max-w-[420px] overflow-hidden rounded-[2rem] border-4 border-[#c9a15d]/70 shadow-2xl">
      <audio ref={audioRef} onEnded={goNextAyah} onError={() => setAudioFailed(true)} className="hidden" />

      <div className="absolute inset-0">
        <SceneBackground sceneId={segment.sceneId} />
        <div className="absolute inset-0 bg-black/35" />
      </div>

      <div className="relative z-10 flex items-center gap-3 px-4 pt-4">
        <div className="h-1 flex-1 rounded-full bg-white/20 overflow-hidden">
          <div
            className="h-full bg-amber-300 transition-all"
            style={{ width: `${Math.min(100, (index / ayahs.length) * 100)}%` }}
          />
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between px-4 pt-2 text-xs text-white/70">
        <span>
          {segment.qari.name} · {segment.qari.style}
        </span>
        <span>
          Reel {reelIndex + 1} / {totalReels}
        </span>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={togglePlay}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && togglePlay()}
        className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center"
      >
        {done ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-black/50 p-6">
            <p className="font-display text-xl font-semibold text-white">Reel complete</p>
            <div className="flex gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  restart();
                }}
                className="rounded-full bg-amber-400 px-5 py-2 text-[#3b2a1a] font-medium"
              >
                Replay
              </button>
              {reelIndex < totalReels - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNextReel();
                  }}
                  className="rounded-full bg-white/10 px-5 py-2 text-white font-medium"
                >
                  Next reel
                </button>
              )}
            </div>
          </div>
        ) : (
          current && (
            <div key={index} className="flex flex-col items-center gap-4" style={{ animation: "rise 0.45s ease" }}>
              {current.bismillah && (
                <div className="rounded-xl border border-amber-200/60 bg-black/35 px-5 py-2.5">
                  <p dir="rtl" className="font-arabic text-2xl leading-relaxed text-amber-100">
                    {current.bismillah}
                  </p>
                </div>
              )}
              {current.arabic && (
                <p dir="rtl" className="font-arabic text-3xl leading-[1.9] text-white drop-shadow-lg sm:text-4xl">
                  {current.arabic}
                </p>
              )}
              <p className="max-w-md text-base text-white/85 drop-shadow">{current.translation}</p>
              {!playing && <span className="text-white/60 text-sm">Paused — tap to resume</span>}
            </div>
          )
        )}
      </div>

      {!done && (
        <div className="relative z-10 flex items-center justify-center gap-6 pb-6">
          <button
            onClick={goPrevAyah}
            className="h-10 w-10 rounded-full bg-white/10 text-white text-lg"
            aria-label="Previous ayah"
          >
            ‹
          </button>
          <button
            onClick={togglePlay}
            className="h-14 w-14 rounded-full bg-amber-400 text-[#3b2a1a] text-xl font-semibold"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? "❚❚" : "▶"}
          </button>
          <button
            onClick={goNextAyah}
            className="h-10 w-10 rounded-full bg-white/10 text-white text-lg"
            aria-label="Next ayah"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
