/**
 * "What does the Qur'an say when…" - hand-curated ayah collections organized by
 * the moment a person is in. Only references live here; the Arabic text and
 * translation are always fetched from the Quran API so nothing is misquoted.
 * Each ref is a single ayah or a short contiguous range (start..end inclusive).
 */

export interface AyahRef {
  surah: number;
  ayah: number;
  /** Inclusive end of a short range; omitted for a single ayah. */
  endAyah?: number;
}

export interface Feeling {
  id: string;
  emoji: string;
  label: string;
  labelArabic: string;
  /** One quiet line under the title - sets the tone, makes it shareable. */
  line: string;
  refs: AyahRef[];
}

export const feelings: Feeling[] = [
  {
    id: "anxious",
    emoji: "🌧️",
    label: "Anxious",
    labelArabic: "قلِق",
    line: "For the chest that feels tight, and the mind that will not go quiet.",
    refs: [
      { surah: 13, ayah: 28 },
      { surah: 94, ayah: 5, endAyah: 6 },
      { surah: 2, ayah: 286 },
      { surah: 65, ayah: 2, endAyah: 3 },
      { surah: 9, ayah: 40 },
    ],
  },
  {
    id: "grieving",
    emoji: "🥀",
    label: "Grieving",
    labelArabic: "حزين",
    line: "For loss, and for the patience that Allah promises to stay beside.",
    refs: [
      { surah: 2, ayah: 155, endAyah: 157 },
      { surah: 2, ayah: 153 },
      { surah: 12, ayah: 86 },
      { surah: 93, ayah: 3 },
    ],
  },
  {
    id: "sinful",
    emoji: "🤲",
    label: "Far from Allah",
    labelArabic: "مقصّر",
    line: "For the one who thinks their sins are too many to come back from.",
    refs: [
      { surah: 39, ayah: 53 },
      { surah: 4, ayah: 110 },
      { surah: 25, ayah: 70 },
      { surah: 3, ayah: 135 },
      { surah: 11, ayah: 114 },
    ],
  },
  {
    id: "lonely",
    emoji: "🌙",
    label: "Lonely",
    labelArabic: "وحيد",
    line: "For the nights when it feels like no one sees you. He does.",
    refs: [
      { surah: 2, ayah: 186 },
      { surah: 50, ayah: 16 },
      { surah: 9, ayah: 40 },
      { surah: 93, ayah: 3 },
    ],
  },
  {
    id: "afraid-future",
    emoji: "🌊",
    label: "Afraid of the future",
    labelArabic: "خائف من الغد",
    line: "For rizq, results, and everything you cannot control.",
    refs: [
      { surah: 11, ayah: 6 },
      { surah: 2, ayah: 216 },
      { surah: 3, ayah: 173 },
      { surah: 26, ayah: 62 },
      { surah: 20, ayah: 46 },
    ],
  },
  {
    id: "weak",
    emoji: "⛰️",
    label: "Defeated",
    labelArabic: "منكسر",
    line: "For when you feel small, behind, or beaten down.",
    refs: [
      { surah: 3, ayah: 139 },
      { surah: 94, ayah: 5, endAyah: 6 },
      { surah: 2, ayah: 214 },
      { surah: 29, ayah: 69 },
    ],
  },
  {
    id: "tempted",
    emoji: "🔥",
    label: "Fighting temptation",
    labelArabic: "يجاهد نفسه",
    line: "For the struggle nobody else can see.",
    refs: [
      { surah: 79, ayah: 40, endAyah: 41 },
      { surah: 41, ayah: 36 },
      { surah: 29, ayah: 69 },
      { surah: 3, ayah: 135 },
    ],
  },
  {
    id: "angry",
    emoji: "🌫️",
    label: "Angry",
    labelArabic: "غاضب",
    line: "For the fire in the chest, and the reward of swallowing it.",
    refs: [
      { surah: 3, ayah: 134 },
      { surah: 42, ayah: 37 },
      { surah: 41, ayah: 34, endAyah: 35 },
      { surah: 7, ayah: 199 },
    ],
  },
  {
    id: "ungrateful",
    emoji: "🌤️",
    label: "Forgetting my blessings",
    labelArabic: "غافل عن النعم",
    line: "For the days everything feels like not enough.",
    refs: [
      { surah: 14, ayah: 7 },
      { surah: 16, ayah: 18 },
      { surah: 55, ayah: 13 },
      { surah: 93, ayah: 11 },
    ],
  },
];

export function getFeeling(id: string): Feeling | undefined {
  return feelings.find((f) => f.id === id);
}
