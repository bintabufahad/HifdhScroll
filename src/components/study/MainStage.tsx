"use client";

import { useEffect, useRef, useState } from "react";
import { extractYouTubeId, extractYouTubePlaylistId } from "@/lib/youtube";
import { EMPTY_LECTURE, type LectureState } from "./useClassSync";

interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  loadVideoById(id: string, startSeconds?: number): void;
  loadPlaylist(opts: { list: string; listType: string; index?: number; startSeconds?: number }): void;
  getCurrentTime(): number;
  getPlayerState(): number;
  destroy(): void;
}
interface YTPlayerOptions {
  videoId?: string;
  playerVars?: Record<string, string | number>;
  events?: { onReady?: () => void; onStateChange?: (e: { data: number }) => void };
}
interface YTNamespace {
  Player: new (el: HTMLElement, opts: YTPlayerOptions) => YTPlayer;
}
declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

function loadYT(): Promise<void> {
  return new Promise((resolve) => {
    if (window.YT?.Player) return resolve();
    if (!document.getElementById("yt-iframe-api")) {
      const s = document.createElement("script");
      s.id = "yt-iframe-api";
      s.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(s);
    }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    const iv = setInterval(() => {
      if (window.YT?.Player) {
        clearInterval(iv);
        resolve();
      }
    }, 200);
  });
}

/** Live playback position implied by a synced lecture state. */
function liveTime(l: LectureState): number {
  return l.playing ? l.time + (Date.now() - l.at) / 1000 : l.time;
}

/**
 * The lecture region. A single video OR a whole YouTube playlist (navigable via
 * the player's own controls). Playback is synchronised for everyone in the class
 * via the YouTube IFrame API - play/pause/seek broadcast and applied.
 */
export default function MainStage({
  lecture,
  onLecture,
}: {
  lecture: LectureState;
  onLecture: (state: LectureState) => void;
}) {
  const [showInput, setShowInput] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const applyingRef = useRef(false);
  const lectureRef = useRef(lecture);
  useEffect(() => {
    lectureRef.current = lecture;
  }, [lecture]);

  const hasLecture = !!lecture.videoId || !!lecture.list;

  // Create (or reload) the player when the video/playlist changes.
  useEffect(() => {
    const { videoId, list } = lecture;
    if (!videoId && !list) {
      playerRef.current?.destroy();
      playerRef.current = null;
      return;
    }
    let cancelled = false;
    (async () => {
      await loadYT();
      if (cancelled || !hostRef.current || !window.YT) return;

      if (playerRef.current) {
        applyingRef.current = true;
        if (list) playerRef.current.loadPlaylist({ list, listType: "playlist" });
        else if (videoId) playerRef.current.loadVideoById(videoId, liveTime(lectureRef.current));
        window.setTimeout(() => (applyingRef.current = false), 900);
        return;
      }

      const holder = document.createElement("div");
      hostRef.current.innerHTML = "";
      hostRef.current.appendChild(holder);
      const playerVars: Record<string, string | number> = { playsinline: 1, rel: 0, modestbranding: 1 };
      if (list) {
        playerVars.listType = "playlist";
        playerVars.list = list;
        playerVars.autoplay = 1;
      } else {
        playerVars.autoplay = lectureRef.current.playing ? 1 : 0;
      }
      playerRef.current = new window.YT.Player(holder, {
        ...(list ? {} : { videoId: videoId ?? undefined }),
        playerVars,
        events: {
          onReady: () => {
            applyingRef.current = true;
            if (!list) {
              playerRef.current?.seekTo(liveTime(lectureRef.current), true);
              if (lectureRef.current.playing) playerRef.current?.playVideo();
              else playerRef.current?.pauseVideo();
            }
            window.setTimeout(() => (applyingRef.current = false), 900);
          },
          onStateChange: (e) => {
            if (applyingRef.current) return;
            if (e.data === 1 || e.data === 2) {
              onLecture({
                videoId: lectureRef.current.videoId,
                list: lectureRef.current.list,
                playing: e.data === 1,
                time: playerRef.current?.getCurrentTime() ?? 0,
                at: Date.now(),
              });
            }
          },
        },
      });
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lecture.videoId, lecture.list]);

  // Apply remote play/pause/seek to an existing player (single-video lectures).
  useEffect(() => {
    const p = playerRef.current;
    if (!p || lecture.list || !lecture.videoId) return;
    applyingRef.current = true;
    const target = liveTime(lecture);
    if (Math.abs((p.getCurrentTime?.() ?? 0) - target) > 1.5) p.seekTo(target, true);
    const st = p.getPlayerState?.();
    if (lecture.playing && st !== 1) p.playVideo();
    if (!lecture.playing && st === 1) p.pauseVideo();
    const to = window.setTimeout(() => (applyingRef.current = false), 900);
    return () => window.clearTimeout(to);
  }, [lecture]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const list = extractYouTubePlaylistId(input);
    const id = extractYouTubeId(input);
    if (!id && !list) {
      setError("That doesn't look like a YouTube link. Paste a full youtube.com or youtu.be URL.");
      return;
    }
    setError("");
    setInput("");
    setShowInput(false);
    onLecture({ videoId: list ? null : id, list: list ?? null, playing: true, time: 0, at: Date.now() });
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
            {hasLecture ? "Change" : "▶ Add lecture"}
          </button>

          {showInput && (
            <form
              onSubmit={submit}
              className="absolute right-0 top-9 z-10 flex w-64 flex-col gap-2 rounded-lg border border-white/12 bg-[#0c1512] p-2 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-white/70">Lecture link</span>
                <button
                  type="button"
                  onClick={() => setShowInput(false)}
                  aria-label="Close"
                  className="flex h-5 w-5 items-center justify-center rounded-full text-white/50 hover:bg-white/10 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <input
                type="url"
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste a YouTube video or playlist link…"
                className="rounded border border-white/15 bg-white/10 px-2 py-1 text-xs text-white outline-none placeholder:text-white/40"
              />
              <button
                type="submit"
                className="rounded bg-emerald-500 px-2 py-1 text-xs font-medium text-emerald-950 hover:bg-emerald-400"
              >
                Play for everyone
              </button>
              {hasLecture && (
                <button
                  type="button"
                  onClick={() => {
                    onLecture({ ...EMPTY_LECTURE });
                    setShowInput(false);
                  }}
                  className="text-[11px] text-red-300/80 hover:text-red-300"
                >
                  Remove current lecture
                </button>
              )}
              {error && <p className="text-xs text-red-300">{error}</p>}
            </form>
          )}
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-white/10 bg-black/50">
        {hasLecture ? (
          <div ref={hostRef} className="h-full w-full [&>*]:h-full [&>*]:w-full" />
        ) : (
          <button
            type="button"
            onClick={() => setShowInput(true)}
            className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/15 text-xl text-emerald-300">
              ▶
            </span>
            <span className="text-xs text-white/50">Tap to paste a YouTube video or playlist link</span>
          </button>
        )}
      </div>
    </div>
  );
}
