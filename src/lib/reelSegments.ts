import { qaris as allQaris } from "./qaris";
import { scenes } from "./scenes";
import type { Ayah, Qari, ReelSegment } from "./types";

/**
 * Below this many (space-stripped) characters, an ayah is short enough to share
 * a reel with its neighbor instead of standing alone - keeps very short ayahs
 * (single words, disjointed letters) from becoming a near-blank reel.
 */
const MIN_STANDALONE_CHARS = 15;
const MAX_AYAHS_PER_REEL = 2;

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

function weightOf(ayah: Ayah): number {
  return (ayah.bismillah?.length ?? 0) + ayah.arabic.replace(/\s/g, "").length;
}

/**
 * Groups consecutive ayahs into short, memorization-sized reels: normally one
 * ayah per reel, occasionally two when the first is too short to stand alone.
 */
function chunkForMemorization(ayahs: Ayah[]): Ayah[][] {
  const chunks: Ayah[][] = [];
  let i = 0;
  while (i < ayahs.length) {
    const group = [ayahs[i]];
    if (weightOf(ayahs[i]) < MIN_STANDALONE_CHARS && group.length < MAX_AYAHS_PER_REEL && i + 1 < ayahs.length) {
      group.push(ayahs[i + 1]);
      i += 2;
    } else {
      i += 1;
    }
    chunks.push(group);
  }
  return chunks;
}

/**
 * Splits a passage into many short reels sized for memorization, cycling through
 * the selected reciters and a shuffled scenery list so pairings vary as they repeat.
 */
export function buildReelSegments(ayahs: Ayah[], selectedQariIds: string[]): ReelSegment[] {
  if (ayahs.length === 0) return [];

  const selectedQaris: Qari[] = allQaris.filter((q) => selectedQariIds.includes(q.id));
  const qariPool = selectedQaris.length > 0 ? selectedQaris : allQaris;

  const chunks = chunkForMemorization(ayahs);
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
