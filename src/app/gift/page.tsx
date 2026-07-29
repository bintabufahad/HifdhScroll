import Link from "next/link";
import { fetchSurahRange } from "@/lib/quranApi";
import { getSurah } from "@/lib/surahs";
import { scenes } from "@/lib/scenes";
import GiftCard from "@/components/gift/GiftCard";

export const dynamic = "force-dynamic";

/**
 * A gifted ayah, opened from a shared link. Public on purpose: the recipient
 * often doesn't have the app yet - this page IS the invitation.
 */
export default async function GiftPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

  const surahNumber = Number(first(sp.s));
  const ayahNumber = Number(first(sp.a));
  const to = (first(sp.to) || "").slice(0, 60);
  const from = (first(sp.from) || "").slice(0, 60);
  const note = (first(sp.note) || "").slice(0, 300);
  const sceneParam = first(sp.scene);
  const sceneId = scenes.some((sc) => sc.id === sceneParam) ? (sceneParam as string) : "goldenhour";

  const surah = getSurah(surahNumber);
  const valid =
    surah && Number.isInteger(ayahNumber) && ayahNumber >= 1 && ayahNumber <= surah.ayahCount;

  if (!valid) {
    return (
      <div className="bg-app-dark flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-6 text-center text-white">
        <p className="text-lg">This gift link seems incomplete.</p>
        <Link href="/" className="rounded-full bg-emerald-500 px-5 py-2 font-medium text-emerald-950 hover:bg-emerald-400">
          Visit Rusookh
        </Link>
      </div>
    );
  }

  let ayah = null;
  try {
    const ayahs = await fetchSurahRange(surahNumber, ayahNumber, surahNumber, ayahNumber);
    ayah = ayahs[0] ?? null;
  } catch {
    ayah = null;
  }

  if (!ayah) {
    return (
      <div className="bg-app-dark flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-6 text-center text-white">
        <p className="text-lg">Couldn&apos;t load this ayah right now — please try again in a moment.</p>
        <Link href="/" className="rounded-full bg-emerald-500 px-5 py-2 font-medium text-emerald-950 hover:bg-emerald-400">
          Visit Rusookh
        </Link>
      </div>
    );
  }

  return <GiftCard ayah={ayah} to={to} from={from} note={note} sceneId={sceneId} />;
}
