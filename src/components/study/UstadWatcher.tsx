"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n";

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
  const { t } = useLanguage();
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
          <span className="mb-10 inline-block max-w-[52vw] rounded-lg bg-black/75 px-2.5 py-1 text-[11px] leading-snug text-emerald-200/90 backdrop-blur sm:mb-14 sm:max-w-none sm:rounded-full sm:px-3 sm:text-xs">
            {t("ustadWatching")}
          </span>
        )}
        <UstadFigure />
      </div>
    </div>
  );
}

/** A dignified, faceless scholar: turban (imamah), a full beard, and a robe - no
 * eyes, nose or mouth (the face is left blank), but clearly read as an Ustad. */
function UstadFigure() {
  return (
    <svg viewBox="0 0 120 210" className="float-soft h-32 w-20 drop-shadow-[0_0_16px_rgba(16,185,129,0.3)] sm:h-48 sm:w-28">
      <defs>
        <linearGradient id="ustadRobe" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#15503f" />
          <stop offset="100%" stopColor="#081f18" />
        </linearGradient>
        <linearGradient id="ustadTurban" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f4efe3" />
          <stop offset="100%" stopColor="#d7cfba" />
        </linearGradient>
      </defs>

      {/* Robe */}
      <path d="M60 96 C32 96 20 126 18 176 L18 210 L102 210 L102 176 C100 126 88 96 60 96 Z" fill="url(#ustadRobe)" stroke="rgba(16,185,129,0.28)" strokeWidth="1.5" />
      {/* Shawl down the front */}
      <path d="M60 98 C47 100 43 122 45 152 L57 142 C57 122 58 110 60 110 C62 110 63 122 63 142 L75 152 C77 122 73 100 60 98 Z" fill="#0e352b" opacity="0.9" />
      {/* Neck */}
      <rect x="53" y="80" width="14" height="18" rx="5" fill="#0b241d" />

      {/* Face - blank, no features */}
      <ellipse cx="60" cy="55" rx="21" ry="24" fill="#0c261e" />
      {/* Full beard framing the lower face */}
      <path d="M39 52 C39 84 50 101 60 101 C70 101 81 84 81 52 C81 72 72 81 60 81 C48 81 39 72 39 52 Z" fill="#cfd6d2" />
      <path d="M44 58 C46 80 53 92 60 92 C67 92 74 80 76 58 C72 70 67 74 60 74 C53 74 48 70 44 58 Z" fill="#aeb8b3" opacity="0.6" />

      {/* Turban (imamah) */}
      <path d="M33 46 C33 21 46 11 60 11 C74 11 87 21 87 46 C87 39 74 33 60 33 C46 33 33 39 33 46 Z" fill="url(#ustadTurban)" stroke="rgba(16,185,129,0.25)" strokeWidth="1" />
      <path d="M33 46 C41 40 50 38 60 38 C70 38 79 40 87 46 C87 50 85 53 82 55 C74 50 67 48 60 48 C53 48 46 50 38 55 C35 53 33 50 33 46 Z" fill="#e7dfcc" />
      {/* Turban tail down one side */}
      <path d="M85 48 C95 53 97 69 89 82 L81 62 Z" fill="#e7dfcc" />
    </svg>
  );
}
