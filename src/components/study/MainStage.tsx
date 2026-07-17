"use client";

import { useState } from "react";
import { extractYouTubeId } from "@/lib/youtube";
import CameraView from "./CameraView";
import type { CameraController } from "./useCamera";

export type StageMode = "lecture" | "camera" | "teacher";

/**
 * The big left panel. It shows the lecture when one is loaded; otherwise, if the
 * camera is on, it shows the camera large (in the lecture's place); otherwise the
 * placeholder teacher. The "add lecture link" control is always available here.
 */
export default function MainStage({
  mode,
  lectureId,
  camera,
  onSetLecture,
  onClear,
}: {
  mode: StageMode;
  lectureId: string | null;
  camera: CameraController;
  onSetLecture: (id: string) => void;
  onClear: () => void;
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
    <div className="glass flex h-full flex-col rounded-2xl p-4">
      <div className="mb-3 flex shrink-0 items-center justify-between gap-2">
        <p className="truncate text-xs font-medium uppercase tracking-widest text-emerald-200/70">
          {mode === "lecture" ? "Lecture" : "Simulated study call — not a real class"}
        </p>
        <div className="relative flex shrink-0 gap-1">
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
              className="rounded-full bg-white/10 px-2 py-1 text-xs font-medium text-white/80 transition hover:bg-white/20"
              aria-label="Remove lecture"
            >
              ✕
            </button>
          )}

          {showInput && (
            <form
              onSubmit={submit}
              className="absolute right-0 top-9 z-10 flex w-64 flex-col gap-2 rounded-lg border border-white/12 bg-[#0c1512] p-2 shadow-xl"
            >
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

      {/* aspect-video on phones gives the video real height; from tablet portrait
          up it fills the column. Without this the iframe collapsed to nothing. */}
      <div className="relative aspect-video w-full sm:aspect-auto sm:min-h-0 sm:flex-1">
        {mode === "lecture" && lectureId ? (
          <iframe
            key={lectureId}
            src={`https://www.youtube-nocookie.com/embed/${lectureId}?autoplay=1`}
            title="Lecture"
            className="h-full w-full rounded-xl border border-white/10"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : mode === "camera" ? (
          <CameraView camera={camera} big />
        ) : (
          // Idle: a small teacher glyph + hint, not a big looming face.
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-xl border border-white/10 bg-gradient-to-b from-[#0f2b23] to-[#05100d] text-center">
            <svg viewBox="0 0 100 100" className="h-12 w-12 text-emerald-400/60" fill="none">
              <circle cx="50" cy="35" r="16" fill="currentColor" opacity="0.85" />
              <path d="M22 88c0-16 12.5-28 28-28s28 12 28 28" fill="currentColor" opacity="0.85" />
            </svg>
            <p className="max-w-xs px-4 text-xs text-white/50">
              Add a lecture link above to begin — or turn your camera on to sit in the class.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
