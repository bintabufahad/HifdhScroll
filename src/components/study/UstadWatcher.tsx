"use client";

import { useEffect, useRef, useState } from "react";

// Sustained focused attention typically starts to dip around the 10-minute
// mark, so after the opening check-in the Ustad returns on roughly that cadence.
const FOCUS_SPAN_MS = 10 * 60 * 1000;
const WATCH_DURATION_MS = 6000;
const FIRST_ARRIVAL_MS = 2500;

/**
 * A faceless "Ustad" (no eyes, nose, or mouth) who arrives at the start of the
 * session with a short sound cue, then periodically peeks back in to keep the
 * student accountable. Purely decorative - it doesn't actually track anything.
 */
export default function UstadWatcher() {
  const [peeking, setPeeking] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const pendingCueRef = useRef(false);

  useEffect(() => {
    // Browsers block audio until a user gesture; unlock (and play any pending
    // opening cue) on the first interaction anywhere on the page.
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

    let timeout: ReturnType<typeof setTimeout>;

    function arrive(withSound: boolean) {
      setPeeking(true);
      if (withSound) {
        // Play now if audio is already unlocked; otherwise remember to play it
        // on the first gesture so the "Ustad is watching" cue isn't lost.
        if (!playCue()) pendingCueRef.current = true;
      }
      timeout = setTimeout(() => {
        setPeeking(false);
        timeout = setTimeout(() => arrive(false), FOCUS_SPAN_MS + (Math.random() - 0.5) * 4 * 60 * 1000);
      }, WATCH_DURATION_MS);
    }

    timeout = setTimeout(() => arrive(true), FIRST_ARRIVAL_MS);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      audioCtxRef.current?.close().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function ensureCtx(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!audioCtxRef.current) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      audioCtxRef.current = new Ctor();
    }
    return audioCtxRef.current;
  }

  /** A short, solemn two-note "the Ustad has entered" cue. Returns false if audio is still locked. */
  function playCue(): boolean {
    const ctx = ensureCtx();
    if (!ctx || ctx.state === "suspended") {
      ctx?.resume().catch(() => {});
      if (ctx?.state !== "running") return false;
    }
    try {
      const now = ctx.currentTime;
      [
        { f: 330, t: 0 },
        { f: 247, t: 0.28 },
      ].forEach(({ f, t }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = f;
        gain.gain.setValueAtTime(0.0001, now + t);
        gain.gain.exponentialRampToValueAtTime(0.22, now + t + 0.04);
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

  return (
    <div
      aria-hidden
      className="ustad-peek pointer-events-none fixed bottom-24 right-0 z-40 select-none"
      style={{ transform: peeking ? "translateX(0)" : "translateX(78%)", opacity: peeking ? 1 : 0.3 }}
    >
      <div className="flex items-end gap-2">
        {peeking && (
          <span className="mb-10 rounded-full bg-black/70 px-3 py-1 text-xs text-emerald-200/90 backdrop-blur">
            👁 The Ustad is watching — stay focused.
          </span>
        )}
        <FacelessUstad />
      </div>
    </div>
  );
}

function FacelessUstad() {
  return (
    <svg viewBox="0 0 120 200" className="float-soft h-44 w-28 drop-shadow-[0_0_18px_rgba(16,185,129,0.35)]">
      <defs>
        <linearGradient id="robe" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f2b23" />
          <stop offset="100%" stopColor="#05100d" />
        </linearGradient>
        <radialGradient id="face" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#12352b" />
          <stop offset="100%" stopColor="#0a1f19" />
        </radialGradient>
      </defs>
      <path d="M60 40 C30 40 18 70 18 120 L18 200 L102 200 L102 120 C102 70 90 40 60 40 Z" fill="url(#robe)" stroke="rgba(16,185,129,0.25)" strokeWidth="1.5" />
      <path d="M60 12 C34 12 24 34 26 58 C34 48 46 44 60 44 C74 44 86 48 94 58 C96 34 86 12 60 12 Z" fill="#08130f" stroke="rgba(16,185,129,0.3)" strokeWidth="1.5" />
      <ellipse cx="60" cy="50" rx="20" ry="24" fill="url(#face)" />
    </svg>
  );
}
