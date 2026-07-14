"use client";

import { useEffect, useState } from "react";

/**
 * A faceless "Ustad" (no eyes, nose, or mouth) who periodically peeks in from
 * the edge of the screen and silently watches - a light, slightly eerie
 * accountability nudge to stay focused, in the spirit of the "someone is
 * watching" meme. Purely decorative; it doesn't actually track anything.
 */
export default function UstadWatcher() {
  const [peeking, setPeeking] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    function schedule(delay: number) {
      timeout = setTimeout(() => {
        setPeeking(true);
        // Stay for a few seconds, then retreat and schedule the next peek.
        timeout = setTimeout(() => {
          setPeeking(false);
          schedule(18000 + Math.random() * 22000); // 18-40s until next peek
        }, 4500);
      }, delay);
    }

    schedule(9000); // first peek ~9s after arriving
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      aria-hidden
      className="ustad-peek pointer-events-none fixed bottom-24 right-0 z-40 select-none"
      style={{
        transform: peeking ? "translateX(0)" : "translateX(78%)",
        opacity: peeking ? 1 : 0.32,
      }}
    >
      <div className="flex items-end gap-2">
        {peeking && (
          <span className="mb-10 hidden rounded-full bg-black/60 px-3 py-1 text-xs text-emerald-200/90 backdrop-blur sm:inline">
            The Ustad is watching — stay focused.
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
      {/* Robe / body */}
      <path d="M60 40 C30 40 18 70 18 120 L18 200 L102 200 L102 120 C102 70 90 40 60 40 Z" fill="url(#robe)" stroke="rgba(16,185,129,0.25)" strokeWidth="1.5" />
      {/* Hood */}
      <path d="M60 12 C34 12 24 34 26 58 C34 48 46 44 60 44 C74 44 86 48 94 58 C96 34 86 12 60 12 Z" fill="#08130f" stroke="rgba(16,185,129,0.3)" strokeWidth="1.5" />
      {/* Blank face - no features */}
      <ellipse cx="60" cy="50" rx="20" ry="24" fill="url(#face)" />
    </svg>
  );
}
