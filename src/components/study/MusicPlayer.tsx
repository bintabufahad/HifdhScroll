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
        className={`flex h-11 w-11 items-center justify-center rounded-full border border-[#c9a15d] shadow-md transition ${
          playing ? "bg-[#7a2e2e] text-[#f5ecd7]" : "bg-[#faf3e2] text-[#7a2e2e] hover:bg-[#f5ecd7]"
        }`}
      >
        <span className={`text-lg ${playing ? "animate-pulse" : ""}`}>♪</span>
      </button>

      {open && (
        <div className="mt-2 w-72 rounded-xl border border-[#c9a15d]/50 bg-[#faf3e2] p-3 shadow-lg">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-[#7a5a30]">Background audio</p>

          <form onSubmit={addTrack} className="mb-3 flex gap-2">
            <input
              type="url"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste an audio (mp3) link…"
              className="flex-1 rounded-lg border border-[#c9a15d]/50 bg-white/70 px-2 py-1.5 text-xs text-[#3b2a1a] outline-none focus:ring-2 focus:ring-[#b8935a]"
            />
            <button
              type="submit"
              className="rounded-lg bg-[#7a2e2e] px-3 py-1.5 text-xs font-medium text-[#f5ecd7] hover:bg-[#8a3a3a]"
            >
              Add
            </button>
          </form>

          {tracks.length === 0 ? (
            <p className="text-center text-xs text-[#7a5a30]">
              No audio yet. Paste a direct link to a Qur&apos;an recitation or nasheed to listen while you study.
            </p>
          ) : (
            <>
              <div className="mb-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="rounded-full bg-[#7a2e2e] px-4 py-1.5 text-xs font-medium text-[#f5ecd7] hover:bg-[#8a3a3a]"
                >
                  {playing ? "⏸ Pause" : "▶ Play"}
                </button>
                {current && <span className="truncate text-xs text-[#5a4530]">{current.label}</span>}
              </div>
              <ul className="flex max-h-40 flex-col gap-1 overflow-y-auto">
                {tracks.map((t, i) => (
                  <li
                    key={`${t.url}-${i}`}
                    className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 ${
                      i === currentIndex ? "border-[#c9a15d] bg-[#c9a15d]/20" : "border-[#c9a15d]/30 bg-white/40"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => playTrack(i)}
                      className="flex-1 truncate text-left text-xs text-[#3b2a1a]"
                    >
                      {t.label}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeTrack(i)}
                      aria-label="Remove audio"
                      className="text-xs text-red-800/70 hover:text-red-800"
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
