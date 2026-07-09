import { qaris as allQaris } from "./qaris";
import { scenes } from "./scenes";
import type { Ayah, Qari, ReelSegment } from "./types";

/** Each reel spans a randomized run of consecutive ayahs in this range. */
const MIN_CHUNK = 10;
const MAX_CHUNK = 20;
/**
 * Segments at or below this length (a short surah like Al-Fatihah, or a
 * typical Mushaf page) can't fit a 10-20 ayah window, so they use a
 * proportional window instead - see randomChunkWithin.
 */
const SHORT_SEGMENT_THRESHOLD = MAX_CHUNK;
const SHORT_SEGMENT_MIN_PROPORTION = 0.3;
const ABSOLUTE_MIN_CHUNK = 3;

interface Segment {
  start: number;
  end: number;
}

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

/** Splits the ayah list into index ranges, one per surah present, so a reel never spans two surahs. */
function findSurahSegments(ayahs: Ayah[]): Segment[] {
  const segments: Segment[] = [];
  let start = 0;
  for (let i = 1; i <= ayahs.length; i++) {
    if (i === ayahs.length || ayahs[i].surahNumber !== ayahs[start].surahNumber) {
      segments.push({ start, end: i - 1 });
      start = i;
    }
  }
  return segments;
}

/**
 * A random window fully inside `segment` - the window size is picked first
 * and then given room to fit, so the average lands in the target range
 * regardless of where the window starts (unlike clamping a fixed-size
 * window to whatever's left, which biases the average down).
 *
 * Segments at or below SHORT_SEGMENT_THRESHOLD (a short surah like
 * Al-Fatihah, or a typical Mushaf page) can't fit the normal 10-20 ayah
 * window, so the window size instead scales with the segment's own length -
 * anywhere from ~30% of it up to the full thing - so reels for a short
 * surah or a single page still vary in start/end instead of every reel
 * just being the whole segment read start to finish.
 */
function randomChunkWithin(ayahs: Ayah[], segment: Segment): Ayah[] {
  const length = segment.end - segment.start + 1;

  if (length <= SHORT_SEGMENT_THRESHOLD) {
    const sizeMin = Math.min(length, Math.max(ABSOLUTE_MIN_CHUNK, Math.round(length * SHORT_SEGMENT_MIN_PROPORTION)));
    if (sizeMin >= length) {
      return ayahs.slice(segment.start, segment.end + 1);
    }
    const size = sizeMin + Math.floor(Math.random() * (length - sizeMin + 1));
    const maxStartOffset = length - size;
    const startOffset = Math.floor(Math.random() * (maxStartOffset + 1));
    const start = segment.start + startOffset;
    return ayahs.slice(start, start + size);
  }

  const size = MIN_CHUNK + Math.floor(Math.random() * (MAX_CHUNK - MIN_CHUNK + 1));
  const maxStartOffset = length - size;
  const startOffset = Math.floor(Math.random() * (maxStartOffset + 1));
  const start = segment.start + startOffset;
  return ayahs.slice(start, start + size);
}

/** Picks a segment at random, weighted by how many ayahs it contains. */
function pickWeightedSegment(segments: Segment[], totalAyahs: number): Segment {
  const r = Math.random() * totalAyahs;
  let acc = 0;
  for (const seg of segments) {
    acc += seg.end - seg.start + 1;
    if (r < acc) return seg;
  }
  return segments[segments.length - 1];
}

/**
 * Generates 2x as many reels as the passage has ayahs, each spanning a
 * randomized ayah run (10-20 ayahs, or a proportional window for short
 * surahs/pages - see randomChunkWithin) that never crosses a surah boundary.
 * Reels are random overlapping windows rather than a clean partition, so a
 * given ayah typically turns up in several different reels, each time with
 * different neighbors, reciter, and scenery - repeated exposure in varied
 * context for memorization. Presentation order is inherently non-sequential
 * since each window's starting point is picked independently at random.
 */
export function buildReelSegments(ayahs: Ayah[], selectedQariIds: string[]): ReelSegment[] {
  if (ayahs.length === 0) return [];

  const selectedQaris: Qari[] = allQaris.filter((q) => selectedQariIds.includes(q.id));
  const qariPool = selectedQaris.length > 0 ? selectedQaris : allQaris;

  const reelCount = ayahs.length * 2;
  const surahSegments = findSurahSegments(ayahs);
  const chunks: Ayah[][] = [];
  for (let n = 0; n < reelCount; n++) {
    const segment = pickWeightedSegment(surahSegments, ayahs.length);
    chunks.push(randomChunkWithin(ayahs, segment));
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
