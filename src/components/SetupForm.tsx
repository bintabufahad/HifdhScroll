"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { surahs, TOTAL_PAGES } from "@/lib/surahs";
import { qaris } from "@/lib/qaris";
import type { ReelMode } from "@/lib/types";

export default function SetupForm() {
  const router = useRouter();
  const [mode, setMode] = useState<ReelMode>("surah");
  const [surah, setSurah] = useState(2);
  const [page, setPage] = useState(1);
  const [startSurah, setStartSurah] = useState(1);
  const [startAyah, setStartAyah] = useState(1);
  const [endSurah, setEndSurah] = useState(1);
  const [endAyah, setEndAyah] = useState(7);
  const [selectedQaris, setSelectedQaris] = useState<string[]>(qaris.map((q) => q.id));

  function toggleQari(id: string) {
    setSelectedQaris((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // keep at least one selected
        return prev.filter((q) => q !== id);
      }
      return [...prev, id];
    });
  }

  function generate() {
    const params = new URLSearchParams({ mode, qaris: selectedQaris.join(",") });
    if (mode === "surah") params.set("surah", String(surah));
    if (mode === "page") params.set("page", String(page));
    if (mode === "range") {
      params.set("startSurah", String(startSurah));
      params.set("startAyah", String(startAyah));
      params.set("endSurah", String(endSurah));
      params.set("endAyah", String(endAyah));
    }
    router.push(`/reel?${params.toString()}`);
  }

  const selectClass =
    "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-500/50 [&>option]:bg-[#0d1512] [&>option]:text-white sm:text-base";
  const inputClass =
    "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/40 focus:ring-2 focus:ring-emerald-500/50 sm:text-base";

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-5 sm:gap-8">
      <section className="glass rounded-2xl p-4 sm:p-5">
        <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-widest text-emerald-200/80">
          Select passage
        </h2>
        <div className="mb-4 flex gap-2">
          {(["surah", "page", "range"] as ReelMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-full border px-4 py-2 text-sm font-medium capitalize transition ${
                mode === m
                  ? "border-emerald-400 bg-emerald-500 text-emerald-950"
                  : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {mode === "surah" && (
          <select value={surah} onChange={(e) => setSurah(Number(e.target.value))} className={selectClass}>
            {surahs.map((s) => (
              <option key={s.number} value={s.number}>
                {s.number}. {s.name} · {s.nameArabic} ({s.ayahCount} ayahs)
              </option>
            ))}
          </select>
        )}

        {mode === "page" && (
          <input
            type="number"
            min={1}
            max={TOTAL_PAGES}
            value={page}
            onChange={(e) => setPage(Number(e.target.value))}
            className={inputClass}
            placeholder={`Mushaf page (1–${TOTAL_PAGES})`}
          />
        )}

        {mode === "range" && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <p className="text-xs text-white/50">Start</p>
              <select value={startSurah} onChange={(e) => setStartSurah(Number(e.target.value))} className={selectClass}>
                {surahs.map((s) => (
                  <option key={s.number} value={s.number}>
                    {s.number}. {s.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={startAyah}
                onChange={(e) => setStartAyah(Number(e.target.value))}
                className={inputClass}
                placeholder="Ayah"
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs text-white/50">End</p>
              <select value={endSurah} onChange={(e) => setEndSurah(Number(e.target.value))} className={selectClass}>
                {surahs.map((s) => (
                  <option key={s.number} value={s.number}>
                    {s.number}. {s.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={endAyah}
                onChange={(e) => setEndAyah(Number(e.target.value))}
                className={inputClass}
                placeholder="Ayah"
              />
            </div>
          </div>
        )}
      </section>

      <section className="glass rounded-2xl p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-emerald-200/80">Reciters</h2>
          <span className="text-right text-xs text-white/50">{selectedQaris.length} selected</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {qaris.map((q) => (
            <QariCheckbox
              key={q.id}
              id={q.id}
              name={q.name}
              checked={selectedQaris.includes(q.id)}
              onToggle={toggleQari}
            />
          ))}
        </div>
      </section>

      <button
        onClick={generate}
        className="lift w-full rounded-full bg-emerald-500 py-3 font-display text-base font-semibold tracking-wide text-emerald-950 transition hover:bg-emerald-400 sm:text-lg"
      >
        Generate Reels
      </button>
    </div>
  );
}

function QariCheckbox({
  id,
  name,
  checked,
  onToggle,
}: {
  id: string;
  name: string;
  checked: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onToggle(id)}
      aria-pressed={checked}
      className={`rounded-full border px-2.5 py-1 text-xs transition ${
        checked
          ? "border-emerald-400 bg-emerald-500 text-emerald-950"
          : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10"
      }`}
    >
      {name}
    </button>
  );
}
