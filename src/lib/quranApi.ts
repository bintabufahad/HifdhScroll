import { getSurah, surahs } from "./surahs";
import type { Ayah, ReelConfig } from "./types";

const API_BASE = "https://api.alquran.cloud/v1";
const ARABIC_EDITION = "quran-uthmani";
const TRANSLATION_EDITION = "en.sahih";
const BISMILLAH = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";
/** At-Tawbah opens with no Bismillah. */
const SURAH_WITHOUT_BISMILLAH = 9;

interface RawAyah {
  number: number;
  text: string;
  numberInSurah: number;
  surah?: { number: number; name: string; englishName: string };
}

interface RawEdition {
  ayahs?: RawAyah[];
  surahs?: { ayahs: RawAyah[] }[];
}

interface RawSingleResponse {
  code: number;
  status: string;
  data: RawEdition;
}

function flattenAyahs(edition: RawEdition): RawAyah[] {
  if (edition.ayahs) return edition.ayahs;
  if (edition.surahs) return edition.surahs.flatMap((s) => s.ayahs);
  return [];
}

async function fetchEditionOnce(path: string): Promise<RawAyah[]> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    throw new Error(`Quran API request failed (${res.status}) for ${path}`);
  }
  const json = (await res.json()) as RawSingleResponse;
  if (json.code !== 200 || !json.data) {
    throw new Error(`Unexpected Quran API response shape for ${path}`);
  }
  return flattenAyahs(json.data);
}

/** The public API occasionally 500s transiently; one retry clears most of those. */
async function fetchEdition(path: string): Promise<RawAyah[]> {
  try {
    return await fetchEditionOnce(path);
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return fetchEditionOnce(path);
  }
}

function splitBismillah(surahNumber: number, numberInSurah: number, text: string): { arabic: string; bismillah: string | null } {
  if (numberInSurah !== 1 || surahNumber === SURAH_WITHOUT_BISMILLAH) {
    return { arabic: text, bismillah: null };
  }
  const trimmed = text.trim();
  if (trimmed === BISMILLAH) {
    return { arabic: "", bismillah: BISMILLAH };
  }
  if (trimmed.startsWith(BISMILLAH)) {
    return { arabic: trimmed.slice(BISMILLAH.length).trim(), bismillah: BISMILLAH };
  }
  return { arabic: text, bismillah: null };
}

function zipEditions(arabic: RawAyah[], translation: RawAyah[], surahNumberFallback?: number): Ayah[] {
  return arabic.map((a, i) => {
    const surahNumber = a.surah?.number ?? surahNumberFallback ?? 0;
    const meta = getSurah(surahNumber);
    const { arabic: arabicText, bismillah } = splitBismillah(surahNumber, a.numberInSurah, a.text);
    return {
      globalNumber: a.number,
      surahNumber,
      surahName: a.surah?.englishName ?? meta?.name ?? "",
      surahNameArabic: meta?.nameArabic ?? "",
      numberInSurah: a.numberInSurah,
      arabic: arabicText,
      translation: translation[i]?.text ?? "",
      bismillah,
    };
  });
}

async function fetchSurahFull(surahNumber: number): Promise<Ayah[]> {
  const [arabic, translation] = await Promise.all([
    fetchEdition(`/surah/${surahNumber}/${ARABIC_EDITION}`),
    fetchEdition(`/surah/${surahNumber}/${TRANSLATION_EDITION}`),
  ]);
  return zipEditions(arabic, translation, surahNumber);
}

async function fetchSurahRange(startSurah: number, startAyah: number, endSurah: number, endAyah: number): Promise<Ayah[]> {
  const result: Ayah[] = [];
  for (let s = startSurah; s <= endSurah; s++) {
    const meta = getSurah(s);
    if (!meta) continue;
    const full = await fetchSurahFull(s);
    const from = s === startSurah ? startAyah : 1;
    const to = s === endSurah ? endAyah : meta.ayahCount;
    result.push(...full.filter((a) => a.numberInSurah >= from && a.numberInSurah <= to));
  }
  return result;
}

async function fetchPage(pageNumber: number): Promise<Ayah[]> {
  const [arabic, translation] = await Promise.all([
    fetchEdition(`/page/${pageNumber}/${ARABIC_EDITION}`),
    fetchEdition(`/page/${pageNumber}/${TRANSLATION_EDITION}`),
  ]);
  return zipEditions(arabic, translation);
}

export async function fetchAyahs(config: ReelConfig): Promise<Ayah[]> {
  if (config.mode === "surah" && config.surah) {
    return fetchSurahFull(config.surah);
  }
  if (config.mode === "page" && config.page) {
    return fetchPage(config.page);
  }
  if (
    config.mode === "range" &&
    config.startSurah &&
    config.startAyah &&
    config.endSurah &&
    config.endAyah
  ) {
    return fetchSurahRange(config.startSurah, config.startAyah, config.endSurah, config.endAyah);
  }
  throw new Error("Incomplete reel configuration");
}

export function isValidSurah(n: number): boolean {
  return surahs.some((s) => s.number === n);
}
