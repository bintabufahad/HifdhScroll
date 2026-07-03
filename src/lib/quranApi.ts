import { getSurah, surahs } from "./surahs";
import type { Ayah, ReelConfig } from "./types";

const API_BASE = "https://api.alquran.cloud/v1";
const EDITIONS = "quran-uthmani,en.sahih";

interface RawAyah {
  number: number;
  text: string;
  numberInSurah: number;
  surah?: { number: number; name: string; englishName: string };
}

interface RawEdition {
  ayahs?: RawAyah[];
  surahs?: { ayahs: RawAyah[] }[];
  number?: number;
  englishName?: string;
  name?: string;
  numberOfAyahs?: number;
}

interface RawResponse {
  code: number;
  status: string;
  data: RawEdition[];
}

function flattenAyahs(edition: RawEdition): RawAyah[] {
  if (edition.ayahs) return edition.ayahs;
  if (edition.surahs) return edition.surahs.flatMap((s) => s.ayahs);
  return [];
}

async function fetchJson(path: string): Promise<RawResponse> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    throw new Error(`Quran API request failed (${res.status}) for ${path}`);
  }
  const json = (await res.json()) as RawResponse;
  if (json.code !== 200 || !Array.isArray(json.data) || json.data.length < 2) {
    throw new Error(`Unexpected Quran API response shape for ${path}`);
  }
  return json;
}

function zipEditions(json: RawResponse, surahNumberFallback?: number): Ayah[] {
  const arabic = flattenAyahs(json.data[0]);
  const translation = flattenAyahs(json.data[1]);

  return arabic.map((a, i) => {
    const surahNumber = a.surah?.number ?? surahNumberFallback ?? 0;
    const meta = getSurah(surahNumber);
    return {
      globalNumber: a.number,
      surahNumber,
      surahName: a.surah?.englishName ?? meta?.name ?? "",
      surahNameArabic: meta?.nameArabic ?? "",
      numberInSurah: a.numberInSurah,
      arabic: a.text,
      translation: translation[i]?.text ?? "",
    };
  });
}

async function fetchSurahFull(surahNumber: number): Promise<Ayah[]> {
  const json = await fetchJson(`/surah/${surahNumber}/editions/${EDITIONS}`);
  return zipEditions(json, surahNumber);
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
  const json = await fetchJson(`/page/${pageNumber}/editions/${EDITIONS}`);
  return zipEditions(json);
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
