import { qaris as allQaris } from "./qaris";
import { scenes } from "./scenes";
import type { Ayah, Qari, ReelSegment } from "./types";

/** Each reel spans a randomized run of consecutive ayahs in this range. */
const MIN_CHUNK = 10;
const MAX_CHUNK = 20;

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

/** A random 10-20 ayah run starting at `startIdx`, clamped to the end of that ayah's surah. */
function randomChunkFrom(ayahs: Ayah[], startIdx: number): Ayah[] {
  const surahNumber = ayahs[startIdx].surahNumber;
  let surahEnd = startIdx;
  while (surahEnd + 1 < ayahs.length && ayahs[surahEnd + 1].surahNumber === surahNumber) {
    surahEnd++;
  }
  const surahRemaining = surahEnd - startIdx + 1;
  const size = Math.min(surahRemaining, MIN_CHUNK + Math.floor(Math.random() * (MAX_CHUNK - MIN_CHUNK + 1)));
  return ayahs.slice(startIdx, startIdx + size);
}

/**
 * Generates 2x as many reels as the passage has ayahs, each spanning a
 * randomized 10-20 ayah run (never crossing a surah boundary). Reels are
 * random overlapping windows rather than a clean partition, so a given ayah
 * typically turns up in several different reels, each time with different
 * neighbors, reciter, and scenery - repeated exposure in varied context for
 * memorization. Presentation order is inherently non-sequential since each
 * window's starting point is picked independently at random.
 */
export function buildReelSegments(ayahs: Ayah[], selectedQariIds: string[]): ReelSegment[] {
  if (ayahs.length === 0) return [];

  const selectedQaris: Qari[] = allQaris.filter((q) => selectedQariIds.includes(q.id));
  const qariPool = selectedQaris.length > 0 ? selectedQaris : allQaris;

  const reelCount = ayahs.length * 2;
  const chunks: Ayah[][] = [];
  for (let n = 0; n < reelCount; n++) {
    const startIdx = Math.floor(Math.random() * ayahs.length);
    chunks.push(randomChunkFrom(ayahs, startIdx));
  }

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
