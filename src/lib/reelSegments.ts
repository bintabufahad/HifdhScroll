import { qaris as allQaris } from "./qaris";
import { scenes } from "./scenes";
import type { Ayah, Qari, ReelMode, ReelSegment } from "./types";

const AYAHS_PER_REEL = 10;
const TARGET_REELS_PER_PAGE = 10;

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function chunkSizeFor(mode: ReelMode, totalAyahs: number): number {
  if (mode === "page") {
    return Math.max(1, Math.ceil(totalAyahs / TARGET_REELS_PER_PAGE));
  }
  return AYAHS_PER_REEL;
}

function chunk(ayahs: Ayah[], size: number): Ayah[][] {
  const chunks: Ayah[][] = [];
  for (let i = 0; i < ayahs.length; i += size) {
    chunks.push(ayahs.slice(i, i + size));
  }
  return chunks;
}

/**
 * Splits a passage into many short reels, cycling through the selected reciters
 * and a shuffled scenery list so consecutive reels don't repeat the same pairing.
 */
export function buildReelSegments(ayahs: Ayah[], mode: ReelMode, selectedQariIds: string[]): ReelSegment[] {
  if (ayahs.length === 0) return [];

  const selectedQaris: Qari[] = allQaris.filter((q) => selectedQariIds.includes(q.id));
  const qariPool = selectedQaris.length > 0 ? selectedQaris : allQaris;

  const size = chunkSizeFor(mode, ayahs.length);
  const chunks = chunk(ayahs, size);

  const qariCycle = shuffle(qariPool);
  const sceneCycle = shuffle(scenes.map((s) => s.id));

  return chunks.map((group, i) => {
    const first = group[0];
    return {
      id: `${first.surahNumber}-${first.numberInSurah}-${i}`,
      ayahs: group,
      qari: qariCycle[i % qariCycle.length],
      sceneId: sceneCycle[i % sceneCycle.length],
    };
  });
}
