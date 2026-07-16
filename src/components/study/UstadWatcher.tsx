"use client";

import { useEffect, useRef, useState } from "react";

const FIRST_ARRIVAL_MS = 5500; // ~5-6s after entering the dashboard
const RETURN_EVERY_MS = 5 * 60 * 1000; // every 5 minutes
const WATCH_DURATION_MS = 6000;

/**
 * A dignified "Ustad" who arrives a few seconds into the session with a short
 * sound cue, then returns every 5 minutes to keep the student accountable. He
 * stays away entirely while a lecture is playing (nothing should interrupt the
 * video). Purely decorative - he doesn't actually track anything.
 */
export default function UstadWatcher({ enabled }: { enabled: boolean }) {
  const [peeking, setPeeking] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const pendingCueRef = useRef(false);

  // Unlock audio on the first user gesture (browsers block autoplay).
  useEffect(() => {
    function unlock() {
      const ctx = ensureCtx();
      ctx?.resume().catch(() => {});
      if (pendingCueRef.current) {
        pendingCueRef.current = false;
        playCue();
      }
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    }
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      audioCtxRef.current?.close().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!enabled) {
      // Defer so this isn't a synchronous setState in the effect body; the
      // component also renders null while disabled, so nothing flashes.
      const reset = setTimeout(() => setPeeking(false), 0);
      return () => clearTimeout(reset);
    }
    let timeout: ReturnType<typeof setTimeout>;

    function arrive() {
      setPeeking(true);
      if (!playCue()) pendingCueRef.current = true;
      timeout = setTimeout(() => {
        setPeeking(false);
        timeout = setTimeout(arrive, RETURN_EVERY_MS);
      }, WATCH_DURATION_MS);
    }

    timeout = setTimeout(arrive, FIRST_ARRIVAL_MS);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  function ensureCtx(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!audioCtxRef.current) {
      const Ctor =
        window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      audioCtxRef.current = new Ctor();
    }
    return audioCtxRef.current;
  }

  /** A short, gentle two-note "the Ustad has entered" cue. Returns false if audio is still locked. */
  function playCue(): boolean {
    const ctx = ensureCtx();
    if (!ctx || ctx.state === "suspended") {
      ctx?.resume().catch(() => {});
      if (ctx?.state !== "running") return false;
    }
    try {
      const now = ctx.currentTime;
      [
        { f: 392, t: 0 },
        { f: 294, t: 0.26 },
      ].forEach(({ f, t }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = f;
        gain.gain.setValueAtTime(0.0001, now + t);
        gain.gain.exponentialRampToValueAtTime(0.2, now + t + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.5);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + t);
        osc.stop(now + t + 0.55);
      });
      return true;
    } catch {
      return false;
    }
  }

  if (!enabled) return null;

  return (
    <div
      aria-hidden
      className="ustad-peek pointer-events-none fixed bottom-24 right-0 z-40 select-none"
      style={{ transform: peeking ? "translateX(0)" : "translateX(80%)", opacity: peeking ? 1 : 0.28 }}
    >
      <div className="flex items-end gap-2">
        {peeking && (
          <span className="mb-10 hidden max-w-[45vw] rounded-full bg-black/70 px-3 py-1 text-xs text-emerald-200/90 backdrop-blur sm:mb-14 sm:inline">
            Assalamu alaikum — the Ustad is watching. Stay focused.
          </span>
        )}
        <UstadFigure />
      </div>
    </div>
  );
}

/** A friendly, dignified scholar: turban (imamah), calm face, beard, and robe. */
function UstadFigure() {
  return (
    <svg viewBox="0 0 120 210" className="float-soft h-32 w-20 drop-shadow-[0_0_16px_rgba(16,185,129,0.3)] sm:h-48 sm:w-28">
      <defs>
        <linearGradient id="ustadRobe" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#14493b" />
          <stop offset="100%" stopColor="#0a231c" />
        </linearGradient>
      </defs>

      {/* Robe / shoulders */}
      <path d="M60 92 C34 92 22 120 20 168 L20 210 L100 210 L100 168 C98 120 86 92 60 92 Z" fill="url(#ustadRobe)" stroke="rgba(16,185,129,0.28)" strokeWidth="1.5" />
      {/* Shawl draped over shoulders */}
      <path d="M60 96 C46 96 40 112 40 132 L52 128 C54 112 56 104 60 104 C64 104 66 112 68 128 L80 132 C80 112 74 96 60 96 Z" fill="#0e352b" opacity="0.9" />

      {/* Neck */}
      <rect x="52" y="78" width="16" height="18" rx="6" fill="#d9ac82" />
      {/* Face */}
      <ellipse cx="60" cy="60" rx="22" ry="24" fill="#e8c39a" />
      {/* Beard */}
      <path d="M39 58 C39 84 50 96 60 96 C70 96 81 84 81 58 C81 74 70 82 60 82 C50 82 39 74 39 58 Z" fill="#e9edf0" opacity="0.92" />
      <path d="M42 62 C46 80 53 90 60 90 C67 90 74 80 78 62 C74 72 68 76 60 76 C52 76 46 72 42 62 Z" fill="#cfd6da" opacity="0.7" />
      {/* Eyes (calm) */}
      <circle cx="52" cy="58" r="2.2" fill="#2a2018" />
      <circle cx="68" cy="58" r="2.2" fill="#2a2018" />
      {/* Gentle brow */}
      <path d="M47 51 q5 -3 10 0" stroke="#8a6a44" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M63 51 q5 -3 10 0" stroke="#8a6a44" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Turban / imamah */}
      <path d="M35 44 C35 22 46 12 60 12 C74 12 85 22 85 44 C85 40 74 34 60 34 C46 34 35 40 35 44 Z" fill="#f3efe6" stroke="rgba(16,185,129,0.25)" strokeWidth="1" />
      <path d="M35 44 C40 40 50 38 60 38 C70 38 80 40 85 44 C85 47 84 50 82 52 C74 47 66 45 60 45 C54 45 46 47 38 52 C36 50 35 47 35 44 Z" fill="#e4ddce" />
      {/* Turban tail */}
      <path d="M83 46 C92 50 94 64 88 74 L82 60 Z" fill="#e4ddce" />
    </svg>
  );
}
