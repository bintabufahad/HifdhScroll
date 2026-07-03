import type { Qari } from "./types";

/** Builds the per-ayah mp3 URL for a reciter on everyayah.com, or null if unavailable. */
export function getAudioUrl(qari: Qari, surahNumber: number, ayahNumberInSurah: number): string | null {
  if (!qari.everyAyahFolder) return null;
  const s = String(surahNumber).padStart(3, "0");
  const a = String(ayahNumberInSurah).padStart(3, "0");
  return `https://everyayah.com/data/${qari.everyAyahFolder}/${s}${a}.mp3`;
}

/** Fallback display duration (ms) when no audio is available, scaled to text length so the reel still paces itself. */
export function estimateReadDurationMs(arabicText: string): number {
  const chars = arabicText.replace(/\s/g, "").length;
  return Math.min(Math.max(chars * 90, 2500), 20000);
}
