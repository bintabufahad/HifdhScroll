import { getQari } from "./qaris";
import { getSurah, TOTAL_PAGES } from "./surahs";
import type { ReelConfig } from "./types";

type ParseResult = { config: ReelConfig } | { error: string };

function toInt(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : undefined;
}

export function parseReelConfig(sp: Record<string, string | undefined>): ParseResult {
  const mode = sp.mode;
  const qaris = (sp.qaris ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id && getQari(id));

  if (qaris.length === 0) return { error: "Please choose at least one reciter." };

  if (mode === "surah") {
    const surah = toInt(sp.surah);
    if (!surah || !getSurah(surah)) return { error: "Please choose a valid surah." };
    return { config: { mode, surah, qaris } };
  }

  if (mode === "page") {
    const page = toInt(sp.page);
    if (!page || page < 1 || page > TOTAL_PAGES) {
      return { error: `Please choose a page between 1 and ${TOTAL_PAGES}.` };
    }
    return { config: { mode, page, qaris } };
  }

  if (mode === "range") {
    const startSurah = toInt(sp.startSurah);
    const startAyah = toInt(sp.startAyah);
    const endSurah = toInt(sp.endSurah);
    const endAyah = toInt(sp.endAyah);
    const startMeta = startSurah ? getSurah(startSurah) : undefined;
    const endMeta = endSurah ? getSurah(endSurah) : undefined;

    if (!startSurah || !startMeta || !endSurah || !endMeta || !startAyah || !endAyah) {
      return { error: "Please choose a valid start and end ayah." };
    }
    if (startAyah < 1 || startAyah > startMeta.ayahCount) {
      return { error: `${startMeta.name} only has ${startMeta.ayahCount} ayahs.` };
    }
    if (endAyah < 1 || endAyah > endMeta.ayahCount) {
      return { error: `${endMeta.name} only has ${endMeta.ayahCount} ayahs.` };
    }
    if (endSurah < startSurah || (endSurah === startSurah && endAyah < startAyah)) {
      return { error: "The range end must come after the start." };
    }
    return { config: { mode, startSurah, startAyah, endSurah, endAyah, qaris } };
  }

  return { error: "Please choose Surah, Page, or Range to build a reel." };
}
