import { qaris as allQaris } from "./qaris";
import { scenes } from "./scenes";
import type { Ayah, Qari, ReelSegment } from "./types";

/** Each reel spans a randomized run of consecutive ayahs in this range, not a fixed size. */
const MIN_CHUNK = 10;
const MAX_CHUNK = 30;

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Assigns pool items to `count` slots, reshuffling at the start of every lap through the pool for variety. */
function cyclicShuffleAssign<T>(pool: T[], count: number): T[] {
  const result: T[] = [];
  let lap: T[] = [];
  for (let i = 0; i < count; i++) {
    if (i % pool.length === 0) lap = shuffle(pool);
    result.push(lap[i % pool.length]);
  }
  return result;
}

/**
 * Groups consecutive ayahs into reels of randomized, variable length (never
 * crossing a surah boundary within one reel), covering the whole passage in
 * order - e.g. reel 1 might be ayahs 1-14, reel 2 ayahs 15-28, and so on.
 */
function chunkVariable(ayahs: Ayah[]): Ayah[][] {
  const chunks: Ayah[][] = [];
  let i = 0;
  while (i < ayahs.length) {
    const surahNumber = ayahs[i].surahNumber;
    let surahEnd = i;
    while (surahEnd + 1 < ayahs.length && ayahs[surahEnd + 1].surahNumber === surahNumber) {
      surahEnd++;
    }
    const surahRemaining = surahEnd - i + 1;

    let size = Math.min(surahRemaining, MIN_CHUNK + Math.floor(Math.random() * (MAX_CHUNK - MIN_CHUNK + 1)));
    if (surahRemaining - size > 0 && surahRemaining - size < MIN_CHUNK) {
      // Avoid leaving a too-small leftover chunk within this surah.
      size = surahRemaining;
    }

    chunks.push(ayahs.slice(i, i + size));
    i += size;
  }
  return chunks;
}

/**
 * Splits a passage into many reels of varied length sized for memorization,
 * cycling through the selected reciters and a shuffled scenery list so
 * pairings vary as they repeat.
 */
export function buildReelSegments(ayahs: Ayah[], selectedQariIds: string[]): ReelSegment[] {
  if (ayahs.length === 0) return [];

  const selectedQaris: Qari[] = allQaris.filter((q) => selectedQariIds.includes(q.id));
  const qariPool = selectedQaris.length > 0 ? selectedQaris : allQaris;

  const chunks = chunkVariable(ayahs);
  const qariAssignments = cyclicShuffleAssign(qariPool, chunks.length);
  const sceneAssignments = cyclicShuffleAssign(
    scenes.map((s) => s.id),
    chunks.length
  );

  return chunks.map((group, i) => {
    const first = group[0];
    return {
      id: `${first.surahNumber}-${first.numberInSurah}-${i}`,
      ayahs: group,
      qari: qariAssignments[i],
      sceneId: sceneAssignments[i],
    };
  });
}
