export type ReelMode = "surah" | "page" | "range";

export interface ReelConfig {
  mode: ReelMode;
  surah?: number;
  page?: number;
  startSurah?: number;
  startAyah?: number;
  endSurah?: number;
  endAyah?: number;
  qari: string;
  scene: string;
}

export interface Ayah {
  globalNumber: number;
  surahNumber: number;
  surahName: string;
  surahNameArabic: string;
  numberInSurah: number;
  arabic: string;
  translation: string;
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
