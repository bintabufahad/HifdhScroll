"use client";

import { useState } from "react";
import { extractYouTubeId } from "@/lib/youtube";

/**
 * The lecture region. Shows the YouTube lecture when one is loaded, otherwise a
 * "paste a lecture link" prompt. This is its own fixed spot - it never swaps
 * with the camera. It fills its grid cell.
 */
export default function MainStage({
  lectureId,
  onSetLecture,
  onClear,
}: {
  lectureId: string | null;
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
    <div className="glass flex h-full flex-col rounded-2xl p-2 sm:p-3">
      <div className="mb-2 flex shrink-0 items-center justify-between gap-1.5">
        <p className="truncate text-[10px] font-medium uppercase tracking-wide text-emerald-200/70 sm:text-xs sm:tracking-widest">
          Lecture
        </p>
        <div className="relative flex shrink-0 gap-1">
          <button
            type="button"
            onClick={() => setShowInput((v) => !v)}
            className="rounded-full bg-emerald-500/90 px-2 py-1 text-[10px] font-medium text-emerald-950 transition hover:bg-emerald-400 sm:px-3 sm:text-xs"
          >
            {lectureId ? "Change" : "▶ Add lecture"}
          </button>
          {lectureId && (
            <button
              type="button"
              onClick={onClear}
              className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-medium text-white/80 transition hover:bg-white/20 sm:text-xs"
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

      <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-white/10 bg-black/50">
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
          <button
            type="button"
            onClick={() => setShowInput(true)}
            className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/15 text-xl text-emerald-300">
              ▶
            </span>
            <span className="text-xs text-white/50">Tap to paste a YouTube lecture link and play it here</span>
          </button>
        )}
      </div>
    </div>
  );
}
