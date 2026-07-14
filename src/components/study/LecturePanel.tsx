"use client";

import { useState } from "react";
import { extractYouTubeId } from "@/lib/youtube";

/**
 * The "teacher" panel of the simulated call. With no lecture loaded it shows a
 * placeholder teacher; once a YouTube link is set (typed here, or picked from
 * the course playlist) it plays the lecture in the teacher's place. Controlled
 * by the parent so the playlist and the dashboard layout can react to whether a
 * lecture is active.
 */
export default function LecturePanel({
  lectureId,
  onSetLecture,
  onClear,
  fill = false,
}: {
  lectureId: string | null;
  onSetLecture: (id: string) => void;
  onClear: () => void;
  /** When true, the video grows to fill the column's height on desktop (big). */
  fill?: boolean;
}) {
  const [showInput, setShowInput] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const id = extractYouTubeId(input);
    if (!id) {
      setError("That doesn't look like a YouTube link. Paste a full youtube.com or youtu.be URL.");
      return;
    }
    setError("");
    setInput("");
    setShowInput(false);
    onSetLecture(id);
  }

  return (
    <div className={`glass flex flex-col rounded-2xl p-4 ${fill ? "h-full" : ""}`}>
      <p className="mb-3 shrink-0 text-center text-xs font-medium uppercase tracking-widest text-emerald-200/70">
        Simulated study call — not a real class, no one else is on this call
      </p>

      <div
        className={`relative flex w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/50 ${
          fill ? "aspect-video lg:aspect-auto lg:min-h-0 lg:flex-1" : "aspect-video"
        }`}
      >
        {lectureId ? (
          <iframe
            key={lectureId}
            src={`https://www.youtube-nocookie.com/embed/${lectureId}?autoplay=1`}
            title="Lecture"
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <TeacherAvatar />
        )}

        <span className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/50 px-2 py-0.5 text-xs text-white/80">
          {lectureId ? "Lecture" : "“Teacher” (demo)"}
        </span>

        <div className="absolute right-2 top-2 flex gap-1">
          <button
            type="button"
            onClick={() => setShowInput((v) => !v)}
            className="rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-medium text-emerald-950 transition hover:bg-emerald-400"
          >
            {lectureId ? "Change lecture" : "▶ Add lecture link"}
          </button>
          {lectureId && (
            <button
              type="button"
              onClick={onClear}
              className="rounded-full bg-black/50 px-2 py-1 text-xs font-medium text-white/80 transition hover:bg-black/70"
              aria-label="Remove lecture"
            >
              ✕
            </button>
          )}
        </div>

        {showInput && (
          <form onSubmit={submit} className="absolute inset-x-2 top-11 flex flex-col gap-2 rounded-lg bg-black/80 p-2 backdrop-blur">
            <input
              type="url"
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste a YouTube lecture link…"
              className="rounded border border-white/15 bg-white/10 px-2 py-1 text-xs text-white outline-none placeholder:text-white/40"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded bg-emerald-500 px-2 py-1 text-xs font-medium text-emerald-950 hover:bg-emerald-400"
              >
                Play here
              </button>
              <button
                type="button"
                onClick={() => setShowInput(false)}
                className="rounded bg-white/10 px-2 py-1 text-xs text-white/80 hover:bg-white/20"
              >
                Cancel
              </button>
            </div>
            {error && <p className="text-xs text-red-300">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}

function TeacherAvatar() {
  return (
    <svg viewBox="0 0 100 100" className="h-16 w-16 text-emerald-400/70" fill="none">
      <circle cx="50" cy="35" r="18" fill="currentColor" opacity="0.85" />
      <path d="M20 90c0-18 13.5-32 30-32s30 14 30 32" fill="currentColor" opacity="0.85" />
    </svg>
  );
}
