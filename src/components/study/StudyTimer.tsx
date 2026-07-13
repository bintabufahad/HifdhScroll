"use client";

import { useEffect, useRef, useState } from "react";

const PRESETS_MINUTES = [15, 25, 45, 60];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export default function StudyTimer({ onSessionComplete }: { onSessionComplete: (seconds: number) => void }) {
  const [presetMinutes, setPresetMinutes] = useState(25);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const elapsedRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setRunning(false);
          elapsedRef.current = presetMinutes * 60;
          onSessionComplete(presetMinutes * 60);
          return 0;
        }
        elapsedRef.current += 1;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  function selectPreset(minutes: number) {
    setPresetMinutes(minutes);
    setRemaining(minutes * 60);
    elapsedRef.current = 0;
    setRunning(false);
  }

  function reset() {
    setRunning(false);
    setRemaining(presetMinutes * 60);
    elapsedRef.current = 0;
  }

  function endAndLogNow() {
    setRunning(false);
    if (elapsedRef.current > 0) {
      onSessionComplete(elapsedRef.current);
    }
    setRemaining(presetMinutes * 60);
    elapsedRef.current = 0;
  }

  return (
    <div className="rounded-2xl border border-[#c9a15d]/40 bg-[#faf3e2] p-4">
      <p className="mb-2 text-xs font-medium uppercase tracking-widest text-[#7a5a30]">Focus timer</p>

      <div className="mb-3 flex justify-center gap-2">
        {PRESETS_MINUTES.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => selectPreset(m)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              presetMinutes === m
                ? "bg-[#7a2e2e] text-[#f5ecd7]"
                : "border border-[#c9a15d]/40 bg-white/50 text-[#5a4530] hover:bg-white/80"
            }`}
          >
            {m}m
          </button>
        ))}
      </div>

      <p className="text-center font-display text-5xl font-bold text-[#3b2a1a]">{formatTime(remaining)}</p>

      <div className="mt-4 flex justify-center gap-2">
        <button
          type="button"
          onClick={() => setRunning((r) => !r)}
          disabled={remaining === 0}
          className="rounded-full bg-[#7a2e2e] px-5 py-2 text-sm font-medium text-[#f5ecd7] hover:bg-[#8a3a3a] disabled:opacity-60"
        >
          {running ? "Pause" : "Start"}
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-full border border-[#c9a15d]/50 bg-white/50 px-5 py-2 text-sm font-medium text-[#5a4530] hover:bg-white/80"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={endAndLogNow}
          className="rounded-full border border-[#c9a15d]/50 bg-white/50 px-5 py-2 text-sm font-medium text-[#5a4530] hover:bg-white/80"
        >
          End &amp; log now
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-[#7a5a30]">
        Finishing (or ending early with time on the clock) logs the session and earns points.
      </p>
    </div>
  );
}
