"use client";

import { useEffect, useRef, useState } from "react";

interface Track {
  url: string;
  label: string;
}

const STORAGE_KEY = "hifdhscroll.study.tracks";

function labelFromUrl(url: string): string {
  try {
    const { pathname } = new URL(url);
    const last = pathname.split("/").filter(Boolean).pop();
    return last ? decodeURIComponent(last) : url;
  } catch {
    return url;
  }
}

/**
 * A small floating audio player (top-right) for background listening while
 * studying - e.g. a Qur'an recitation the user pastes a direct audio link to.
 * The list is kept in localStorage, so it needs no backend and survives
 * reloads. Direct audio URLs only (mp3/ogg/etc.); it isn't a YouTube player -
 * the lecture panel handles video.
 */
function loadStoredTracks(): Track[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Track[]) : [];
  } catch {
    return [];
  }
}

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [open, setOpen] = useState(false);
  const [tracks, setTracks] = useState<Track[]>(loadStoredTracks);
  const [input, setInput] = useState("");
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
    } catch {
      // ignore storage write failures (private mode, quota)
    }
  }, [tracks]);

  function addTrack(e: React.FormEvent) {
    e.preventDefault();
    const url = input.trim();
    if (!url) return;
    try {
      new URL(url);
    } catch {
      return;
    }
    setTracks((prev) => [...prev, { url, label: labelFromUrl(url) }]);
    setInput("");
  }

  function playTrack(index: number) {
    setCurrentIndex(index);
    // Let the src update before playing.
    requestAnimationFrame(() => {
      audioRef.current?.play().catch(() => setPlaying(false));
    });
  }

  function togglePlay() {
    if (currentIndex === null) {
      if (tracks.length > 0) playTrack(0);
      return;
    }
    if (playing) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play().catch(() => setPlaying(false));
    }
  }

  function removeTrack(index: number) {
    setTracks((prev) => prev.filter((_, i) => i !== index));
    if (currentIndex === index) {
      audioRef.current?.pause();
      setCurrentIndex(null);
      setPlaying(false);
    }
  }

  const current = currentIndex !== null ? tracks[currentIndex] : null;

  return (
    <div className="fixed right-4 top-4 z-50">
      <audio
        ref={audioRef}
        src={current?.url}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          if (currentIndex !== null && currentIndex + 1 < tracks.length) {
            playTrack(currentIndex + 1);
          } else {
            setPlaying(false);
          }
        }}
      />

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Audio player"
        className={`lift flex h-11 w-11 items-center justify-center rounded-full border shadow-md transition ${
          playing
            ? "border-emerald-400/60 bg-emerald-500 text-emerald-950 emerald-glow"
            : "glass-strong text-emerald-200 hover:text-white"
        }`}
      >
        <span className={`text-lg ${playing ? "animate-pulse" : ""}`}>♪</span>
      </button>

      {open && (
        <div className="glass-strong animate-rise-in mt-2 w-72 rounded-xl p-3 shadow-xl">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-emerald-200/70">Background audio</p>

          <form onSubmit={addTrack} className="mb-3 flex gap-2">
            <input
              type="url"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste an audio (mp3) link…"
              className="flex-1 rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-xs text-white outline-none placeholder:text-white/40 focus:ring-2 focus:ring-emerald-500/50"
            />
            <button
              type="submit"
              className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-emerald-950 hover:bg-emerald-400"
            >
              Add
            </button>
          </form>

          {tracks.length === 0 ? (
            <p className="text-center text-xs text-white/45">
              No audio yet. Paste a direct link to a Qur&apos;an recitation or nasheed to listen while you study.
            </p>
          ) : (
            <>
              <div className="mb-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-medium text-emerald-950 hover:bg-emerald-400"
                >
                  {playing ? "⏸ Pause" : "▶ Play"}
                </button>
                {current && <span className="truncate text-xs text-white/60">{current.label}</span>}
              </div>
              <ul className="flex max-h-40 flex-col gap-1 overflow-y-auto">
                {tracks.map((t, i) => (
                  <li
                    key={`${t.url}-${i}`}
                    className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 ${
                      i === currentIndex ? "border-emerald-400/50 bg-emerald-500/15" : "border-white/10 bg-white/5"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => playTrack(i)}
                      className="flex-1 truncate text-left text-xs text-white/85"
                    >
                      {t.label}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeTrack(i)}
                      aria-label="Remove audio"
                      className="text-xs text-red-300/70 hover:text-red-300"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
