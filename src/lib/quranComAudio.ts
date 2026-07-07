/**
 * Fallback audio source for when a reciter's EveryAyah.com folder guesses all
 * fail. quran.com publishes an actively-maintained, documented reciter list
 * and per-ayah audio API, so it has an independent chance of covering a
 * reciter EveryAyah's undocumented folder-naming scheme doesn't turn up.
 */

const API_BASE = "https://api.quran.com/api/v4";

interface Recitation {
  id: number;
  reciter_name: string;
}

let recitationsCache: Promise<Recitation[]> | null = null;

function fetchRecitations(): Promise<Recitation[]> {
  if (!recitationsCache) {
    recitationsCache = fetch(`${API_BASE}/resources/recitations?language=en`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("recitations request failed"))))
      .then((json) => (json.recitations as Recitation[]) ?? [])
      .catch(() => []);
  }
  return recitationsCache;
}

/** Loosely matches "Muhammad Al-Luhaidan" against quran.com's own naming (e.g. "Muhammad al-Luhaidan"). */
function normalize(name: string): string {
  return name.toLowerCase().replace(/[^a-z]/g, "");
}

function nameMatches(reciterName: string, target: string): boolean {
  const a = normalize(reciterName);
  const b = normalize(target);
  // Compare on the distinctive surname fragment rather than the whole name,
  // since honorifics/ordering/transliteration vary between sources.
  const targetKey = b.slice(-Math.min(8, b.length));
  return a.includes(targetKey);
}

export async function resolveQuranComAudioUrl(
  reciterName: string,
  surahNumber: number,
  ayahNumberInSurah: number
): Promise<string | null> {
  try {
    const recitations = await fetchRecitations();
    const match = recitations.find((r) => nameMatches(r.reciter_name, reciterName));
    if (!match) return null;

    const res = await fetch(`${API_BASE}/recitations/${match.id}/by_ayah/${surahNumber}:${ayahNumberInSurah}`);
    if (!res.ok) return null;
    const json = await res.json();
    const path: string | undefined = json?.audio_files?.[0]?.url;
    if (!path) return null;
    return path.startsWith("http") ? path : `https://verses.quran.com/${path}`;
  } catch {
    return null;
  }
}
