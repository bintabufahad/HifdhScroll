import type { Qari } from "./types";

/** All per-ayah mp3 URL candidates for a reciter on everyayah.com, in priority order. */
export function getAudioUrlCandidates(qari: Qari, surahNumber: number, ayahNumberInSurah: number): string[] {
  const s = String(surahNumber).padStart(3, "0");
  const a = String(ayahNumberInSurah).padStart(3, "0");
  return qari.everyAyahFolders.map((folder) => `https://everyayah.com/data/${folder}/${s}${a}.mp3`);
}

/** Fallback display duration (ms) when no audio is available, scaled to text length so the reel still paces itself. */
export function estimateReadDurationMs(arabicText: string): number {
  const chars = arabicText.replace(/\s/g, "").length;
  return Math.min(Math.max(chars * 90, 2500), 20000);
}
