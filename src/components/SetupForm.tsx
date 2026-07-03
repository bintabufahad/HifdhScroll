"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { surahs, TOTAL_PAGES } from "@/lib/surahs";
import { qaris } from "@/lib/qaris";
import { scenes } from "@/lib/scenes";
import SceneBackground from "@/components/SceneBackground";
import type { ReelMode } from "@/lib/types";

export default function SetupForm() {
  const router = useRouter();
  const [mode, setMode] = useState<ReelMode>("surah");
  const [surah, setSurah] = useState(1);
  const [page, setPage] = useState(1);
  const [startSurah, setStartSurah] = useState(1);
  const [startAyah, setStartAyah] = useState(1);
  const [endSurah, setEndSurah] = useState(1);
  const [endAyah, setEndAyah] = useState(7);
  const [qari, setQari] = useState("alafasy");
  const [scene, setScene] = useState("sunset");

  const murattal = useMemo(() => qaris.filter((q) => q.style === "Murattal"), []);
  const mujawwad = useMemo(() => qaris.filter((q) => q.style === "Mujawwad"), []);

  function generate() {
    const params = new URLSearchParams({ mode, qari, scene });
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
        <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-300 mb-3">Select passage</h2>
        <div className="flex gap-2 mb-4">
          {(["surah", "page", "range"] as ReelMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition ${
                mode === m ? "bg-emerald-500 text-emerald-950" : "bg-white/10 text-white/70 hover:bg-white/20"
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
            className="w-full rounded-lg bg-white/10 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-400"
          >
            {surahs.map((s) => (
              <option key={s.number} value={s.number} className="text-black">
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
            className="w-full rounded-lg bg-white/10 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder={`Mushaf page (1–${TOTAL_PAGES})`}
          />
        )}

        {mode === "range" && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <p className="text-xs text-white/50">Start</p>
              <select
                value={startSurah}
                onChange={(e) => setStartSurah(Number(e.target.value))}
                className="w-full rounded-lg bg-white/10 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-400"
              >
                {surahs.map((s) => (
                  <option key={s.number} value={s.number} className="text-black">
                    {s.number}. {s.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={startAyah}
                onChange={(e) => setStartAyah(Number(e.target.value))}
                className="w-full rounded-lg bg-white/10 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Ayah"
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs text-white/50">End</p>
              <select
                value={endSurah}
                onChange={(e) => setEndSurah(Number(e.target.value))}
                className="w-full rounded-lg bg-white/10 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-400"
              >
                {surahs.map((s) => (
                  <option key={s.number} value={s.number} className="text-black">
                    {s.number}. {s.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={endAyah}
                onChange={(e) => setEndAyah(Number(e.target.value))}
                className="w-full rounded-lg bg-white/10 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Ayah"
              />
            </div>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-300 mb-3">Reciter</h2>
        <p className="text-xs text-white/40 mb-2">Murattal</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {murattal.map((q) => (
            <QariButton key={q.id} id={q.id} name={q.name} available={!!q.everyAyahFolder} selected={qari === q.id} onSelect={setQari} />
          ))}
        </div>
        <p className="text-xs text-white/40 mb-2">Mujawwad</p>
        <div className="flex flex-wrap gap-2">
          {mujawwad.map((q) => (
            <QariButton key={q.id} id={q.id} name={q.name} available={!!q.everyAyahFolder} selected={qari === q.id} onSelect={setQari} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-300 mb-3">Scenery</h2>
        <div className="grid grid-cols-3 gap-3">
          {scenes.map((s) => (
            <button
              key={s.id}
              onClick={() => setScene(s.id)}
              className={`relative aspect-[9/12] overflow-hidden rounded-xl ring-2 transition ${
                scene === s.id ? "ring-emerald-400" : "ring-transparent hover:ring-white/30"
              }`}
            >
              <SceneBackground sceneId={s.id} />
              <span className="absolute bottom-1 inset-x-0 text-center text-[10px] font-medium text-white bg-black/40 py-0.5">
                {s.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      <button
        onClick={generate}
        className="w-full rounded-full bg-emerald-500 py-3 text-emerald-950 font-semibold text-lg hover:bg-emerald-400 transition"
      >
        Generate Reel
      </button>
    </div>
  );
}

function QariButton({
  id,
  name,
  available,
  selected,
  onSelect,
}: {
  id: string;
  name: string;
  available: boolean;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(id)}
      className={`px-3 py-2 rounded-lg text-sm transition ${
        selected ? "bg-emerald-500 text-emerald-950" : "bg-white/10 text-white/80 hover:bg-white/20"
      }`}
    >
      {name}
      {!available && <span className="ml-1 text-[10px] opacity-60">(audio pending)</span>}
    </button>
  );
}
