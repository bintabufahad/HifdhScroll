"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n";

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

/** Compact focus timer - deliberately small, tucked in the sidebar corner. */
export default function StudyTimer({ onSessionComplete }: { onSessionComplete: (seconds: number) => void }) {
  const { t } = useLanguage();
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

  function endAndLogNow() {
    setRunning(false);
    if (elapsedRef.current > 0) onSessionComplete(elapsedRef.current);
    setRemaining(presetMinutes * 60);
    elapsedRef.current = 0;
  }

  const progress = 1 - remaining / (presetMinutes * 60);

  return (
    <div className="glass rounded-2xl px-3 py-2.5">
      <div className="flex items-center gap-3">
        <span className="font-display text-2xl font-bold tabular-nums text-white">{formatTime(remaining)}</span>

        <button
          type="button"
          onClick={() => setRunning((r) => !r)}
          disabled={remaining === 0}
          className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-medium text-emerald-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          {running ? t("timerPause") : t("timerStart")}
        </button>
        <button
          type="button"
          onClick={endAndLogNow}
          className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/75 hover:bg-white/10"
        >
          {t("timerEnd")}
        </button>

        <div className="ml-auto flex gap-1">
          {PRESETS_MINUTES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => selectPreset(m)}
              className={`rounded px-1.5 py-0.5 text-[11px] font-medium transition ${
                presetMinutes === m ? "bg-emerald-500 text-emerald-950" : "text-white/50 hover:text-white"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-1000"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
    </div>
  );
}
