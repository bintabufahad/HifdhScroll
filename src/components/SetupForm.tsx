"use client";

import { useMemo, useState } from "react";
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

  const murattal = useMemo(() => qaris.filter((q) => q.style === "Murattal"), []);
  const mujawwad = useMemo(() => qaris.filter((q) => q.style === "Mujawwad"), []);

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

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-8">
      <section>
        <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-[#7a4a1e] mb-3">
          Select passage
        </h2>
        <div className="flex gap-2 mb-4">
          {(["surah", "page", "range"] as ReelMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition border ${
                mode === m
                  ? "bg-[#7a2e2e] text-[#f5ecd7] border-[#7a2e2e]"
                  : "bg-[#f5ecd7]/60 text-[#5a4530] border-[#c9a15d]/40 hover:bg-[#f5ecd7]"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {mode === "surah" && (
          <select
            value={surah}
            onChange={(e) => setSurah(Number(e.target.value))}
            className="w-full rounded-lg border border-[#c9a15d]/50 bg-[#faf3e2] px-4 py-3 text-[#3b2a1a] outline-none focus:ring-2 focus:ring-[#b8935a]"
          >
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
            className="w-full rounded-lg border border-[#c9a15d]/50 bg-[#faf3e2] px-4 py-3 text-[#3b2a1a] outline-none focus:ring-2 focus:ring-[#b8935a]"
            placeholder={`Mushaf page (1–${TOTAL_PAGES})`}
          />
        )}

        {mode === "range" && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <p className="text-xs text-[#7a5a30]">Start</p>
              <select
                value={startSurah}
                onChange={(e) => setStartSurah(Number(e.target.value))}
                className="w-full rounded-lg border border-[#c9a15d]/50 bg-[#faf3e2] px-3 py-2 text-[#3b2a1a] outline-none focus:ring-2 focus:ring-[#b8935a]"
              >
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
                className="w-full rounded-lg border border-[#c9a15d]/50 bg-[#faf3e2] px-3 py-2 text-[#3b2a1a] outline-none focus:ring-2 focus:ring-[#b8935a]"
                placeholder="Ayah"
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs text-[#7a5a30]">End</p>
              <select
                value={endSurah}
                onChange={(e) => setEndSurah(Number(e.target.value))}
                className="w-full rounded-lg border border-[#c9a15d]/50 bg-[#faf3e2] px-3 py-2 text-[#3b2a1a] outline-none focus:ring-2 focus:ring-[#b8935a]"
              >
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
                className="w-full rounded-lg border border-[#c9a15d]/50 bg-[#faf3e2] px-3 py-2 text-[#3b2a1a] outline-none focus:ring-2 focus:ring-[#b8935a]"
                placeholder="Ayah"
              />
            </div>
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-[#7a4a1e]">Reciters</h2>
          <span className="text-xs text-[#7a5a30]">{selectedQaris.length} selected · reels cycle through them</span>
        </div>
        <p className="text-xs text-[#7a5a30] mb-2">Murattal</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {murattal.map((q) => (
            <QariCheckbox
              key={q.id}
              id={q.id}
              name={q.name}
              checked={selectedQaris.includes(q.id)}
              onToggle={toggleQari}
            />
          ))}
        </div>
        <p className="text-xs text-[#7a5a30] mb-2">Mujawwad</p>
        <div className="flex flex-wrap gap-2">
          {mujawwad.map((q) => (
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
        className="w-full rounded-full bg-[#7a2e2e] py-3 text-[#f5ecd7] font-display font-semibold text-lg tracking-wide hover:bg-[#8a3a3a] transition"
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
      className={`px-3 py-2 rounded-lg text-sm transition border ${
        checked
          ? "bg-[#7a2e2e] text-[#f5ecd7] border-[#7a2e2e]"
          : "bg-[#f5ecd7]/50 text-[#5a4530] border-[#c9a15d]/40 hover:bg-[#f5ecd7]"
      }`}
    >
      {name}
    </button>
  );
}
