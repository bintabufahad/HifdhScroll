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

  const progress = 1 - remaining / (presetMinutes * 60);

  return (
    <div className="glass rounded-2xl p-4">
      <p className="mb-2 text-xs font-medium uppercase tracking-widest text-emerald-200/70">Focus timer</p>

      <div className="mb-3 flex justify-center gap-2">
        {PRESETS_MINUTES.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => selectPreset(m)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              presetMinutes === m
                ? "bg-emerald-500 text-emerald-950"
                : "border border-white/15 bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            {m}m
          </button>
        ))}
      </div>

      {/* Circular-ish progress via a top bar. */}
      <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-1000"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>

      <p className="text-center font-display text-5xl font-bold tabular-nums text-white">{formatTime(remaining)}</p>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => setRunning((r) => !r)}
          disabled={remaining === 0}
          className="lift rounded-full bg-emerald-500 px-5 py-2 text-sm font-medium text-emerald-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          {running ? "Pause" : "Start"}
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-medium text-white/80 hover:bg-white/10"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={endAndLogNow}
          className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-medium text-white/80 hover:bg-white/10"
        >
          End &amp; log
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-white/45">
        Finishing (or ending early with time on the clock) logs the session and earns points.
      </p>
    </div>
  );
}
