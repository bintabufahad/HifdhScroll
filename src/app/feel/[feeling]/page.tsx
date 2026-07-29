import { notFound } from "next/navigation";
import { fetchSurahRange } from "@/lib/quranApi";
import { getFeeling } from "@/lib/feelings";
import FeelingViewer from "@/components/feel/FeelingViewer";
import type { Ayah } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function FeelingPage({ params }: { params: Promise<{ feeling: string }> }) {
  const { feeling: feelingId } = await params;
  const feeling = getFeeling(feelingId);
  if (!feeling) notFound();

  // Fetch every referenced ayah/range in parallel; skip any that fail so one
  // flaky API response never blanks the whole collection.
  const results = await Promise.allSettled(
    feeling.refs.map((r) => fetchSurahRange(r.surah, r.ayah, r.surah, r.endAyah ?? r.ayah))
  );
  const groups: Ayah[][] = results
    .filter((r): r is PromiseFulfilledResult<Ayah[]> => r.status === "fulfilled" && r.value.length > 0)
    .map((r) => r.value);

  return <FeelingViewer feeling={feeling} groups={groups} />;
}
