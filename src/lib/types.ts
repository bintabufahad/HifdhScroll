export type ReelMode = "surah" | "page" | "range";

export interface ReelConfig {
  mode: ReelMode;
  surah?: number;
  page?: number;
  startSurah?: number;
  startAyah?: number;
  endSurah?: number;
  endAyah?: number;
  /** Reciter ids the user allowed; reels cycle through these. */
  qaris: string[];
}

export interface Ayah {
  globalNumber: number;
  surahNumber: number;
  surahName: string;
  surahNameArabic: string;
  numberInSurah: number;
  arabic: string;
  translation: string;
  /** Set when this ayah opens with (or, for Al-Fatihah's first ayah, IS) the Bismillah, so it can render as its own banner. */
  bismillah: string | null;
}

export type QariStyle = "Murattal" | "Mujawwad";

export interface Qari {
  id: string;
  name: string;
  style: QariStyle;
  /** EveryAyah.com folder name for per-ayah mp3s, or null if not available yet. */
  everyAyahFolder: string | null;
}

export interface Scene {
  id: string;
  name: string;
}

/** One generated short reel: a slice of ayahs paired with a reciter and a backdrop. */
export interface ReelSegment {
  id: string;
  ayahs: Ayah[];
  qari: Qari;
  sceneId: string;
}
