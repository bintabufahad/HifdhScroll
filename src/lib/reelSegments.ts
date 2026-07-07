import { qaris as allQaris } from "./qaris";
import { scenes } from "./scenes";
import type { Ayah, Qari, ReelSegment } from "./types";

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
 * Splits a passage into 2x as many reels as it has ayahs: each ayah gets its
 * own single-ayah reel, twice over (so it's reviewed twice, each time with a
 * different reciter/scenery pairing), and the combined list is shuffled into
 * non-sequential order - a reel for ayah 30 might be followed by one for
 * ayah 112, then one for ayah 58. Reciters and scenery cycle through a
 * shuffled pool so pairings vary as they repeat.
 */
export function buildReelSegments(ayahs: Ayah[], selectedQariIds: string[]): ReelSegment[] {
  if (ayahs.length === 0) return [];

  const selectedQaris: Qari[] = allQaris.filter((q) => selectedQariIds.includes(q.id));
  const qariPool = selectedQaris.length > 0 ? selectedQaris : allQaris;

  const singleAyahReels = ayahs.map((a) => [a]);
  const chunks = shuffle([...singleAyahReels, ...singleAyahReels]);

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
