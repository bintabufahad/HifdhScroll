"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import SceneBackground from "@/components/SceneBackground";
import { fetchAyahs } from "@/lib/quranApi";
import { getQari } from "@/lib/qaris";
import { getAudioUrl, estimateReadDurationMs } from "@/lib/audio";
import type { Ayah, ReelConfig } from "@/lib/types";

export default function ReelPlayer({ config }: { config: ReelConfig }) {
  const [ayahs, setAyahs] = useState<Ayah[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [audioFailed, setAudioFailed] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const qari = getQari(config.qari);

  useEffect(() => {
    let cancelled = false;
    fetchAyahs(config)
      .then((data) => {
        if (!cancelled) setAyahs(data);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load this passage. Please check your connection and try again.");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = ayahs?.[index];
  const done = ayahs !== null && index >= ayahs.length;

  function goNext() {
    setAudioFailed(false);
    setIndex((i) => i + 1);
  }
  function goPrev() {
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
    if (!current || !qari || done) return;

    const url = getAudioUrl(qari, current.surahNumber, current.numberInSurah);
    const audio = audioRef.current;

    if (url && audio && !audioFailed) {
      audio.src = url;
      if (playing) audio.play().catch(() => setAudioFailed(true));
      return;
    }

    // No audio source (unavailable reciter, or this ayah's file failed): pace by reading time instead.
    if (playing) {
      timerRef.current = setTimeout(goNext, estimateReadDurationMs(current.arabic));
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, ayahs, playing, audioFailed]);

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

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-black px-6 text-center text-white">
        <p className="text-lg">{error}</p>
        <Link href="/" className="rounded-full bg-emerald-500 px-5 py-2 text-emerald-950 font-medium">
          Back to setup
        </Link>
      </div>
    );
  }

  if (!ayahs) {
    return (
      <div className="flex flex-1 items-center justify-center bg-black text-white/70">
        Loading passage…
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-black">
      <audio
        ref={audioRef}
        onEnded={goNext}
        onError={() => setAudioFailed(true)}
        className="hidden"
      />

      <div className="absolute inset-0">
        <SceneBackground sceneId={config.scene} />
        <div className="absolute inset-0 bg-black/35" />
      </div>

      <div className="relative z-10 flex items-center gap-3 px-4 pt-4">
        <Link href="/" className="text-white/80 text-xl">
          ‹
        </Link>
        <div className="h-1 flex-1 rounded-full bg-white/20 overflow-hidden">
          <div
            className="h-full bg-emerald-400 transition-all"
            style={{ width: `${Math.min(100, (index / ayahs.length) * 100)}%` }}
          />
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between px-4 pt-2 text-xs text-white/60">
        <span>{qari?.name} · {qari?.style}</span>
        {current && (
          <span>
            {current.surahName} {current.numberInSurah}
          </span>
        )}
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={togglePlay}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && togglePlay()}
        className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center"
      >
        {done ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-black/50 p-8">
            <p className="text-2xl font-semibold text-white">Reel complete</p>
            <div className="flex gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  restart();
                }}
                className="rounded-full bg-emerald-500 px-5 py-2 text-emerald-950 font-medium"
              >
                Replay
              </button>
              <Link
                href="/"
                onClick={(e) => e.stopPropagation()}
                className="rounded-full bg-white/10 px-5 py-2 text-white font-medium"
              >
                New reel
              </Link>
            </div>
          </div>
        ) : (
          current && (
            <div key={index} className="flex flex-col items-center gap-6" style={{ animation: "rise 0.45s ease" }}>
              <p dir="rtl" className="font-arabic text-4xl leading-[1.9] text-white drop-shadow-lg sm:text-5xl">
                {current.arabic}
              </p>
              <p className="max-w-md text-lg text-white/85 drop-shadow">{current.translation}</p>
              {!playing && <span className="text-white/60 text-sm">Paused — tap to resume</span>}
            </div>
          )
        )}
      </div>

      {!done && (
        <div className="relative z-10 flex items-center justify-center gap-8 pb-8">
          <button
            onClick={goPrev}
            className="h-11 w-11 rounded-full bg-white/10 text-white text-lg"
            aria-label="Previous ayah"
          >
            ‹
          </button>
          <button
            onClick={togglePlay}
            className="h-14 w-14 rounded-full bg-emerald-500 text-emerald-950 text-xl font-semibold"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? "❚❚" : "▶"}
          </button>
          <button
            onClick={goNext}
            className="h-11 w-11 rounded-full bg-white/10 text-white text-lg"
            aria-label="Next ayah"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
