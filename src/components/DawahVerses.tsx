"use client";

import { useEffect, useState } from "react";
import { fetchSurahRange } from "@/lib/quranApi";
import type { Ayah } from "@/lib/types";

// An-Nahl 16:125 and Fussilat 41:33 - both classic verses on calling others to
// the way of Allah, fetched live (not hand-transcribed) from the same source
// used for reels, so the Arabic/translation shown here is verified, not typed
// from memory.
const REFERENCES: [number, number][] = [
  [16, 125],
  [41, 33],
];

export default function DawahVerses() {
  const [verses, setVerses] = useState<Ayah[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all(REFERENCES.map(([surah, ayah]) => fetchSurahRange(surah, ayah, surah, ayah)))
      .then((results) => {
        if (!cancelled) setVerses(results.flat());
      })
      .catch(() => {
        // Not critical to the page's function - just skip rendering the verses.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!verses || verses.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {verses.map((v) => (
        <div key={v.globalNumber} className="glass rounded-xl px-5 py-4">
          <p dir="rtl" className="font-arabic text-xl leading-relaxed text-white">
            {v.arabic}
          </p>
          <p className="mt-2 text-sm text-white/70">&ldquo;{v.translation}&rdquo;</p>
          <p className="mt-1 text-xs text-emerald-300/80">
            — {v.surahName} {v.numberInSurah}
          </p>
        </div>
      ))}
    </div>
  );
}
