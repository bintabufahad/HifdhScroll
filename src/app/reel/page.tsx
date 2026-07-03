import Link from "next/link";
import { parseReelConfig } from "@/lib/reelConfig";
import ReelPlayer from "@/components/ReelPlayer";

export default async function ReelPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const flat: Record<string, string | undefined> = {};
  for (const key in sp) {
    const v = sp[key];
    flat[key] = Array.isArray(v) ? v[0] : v;
  }

  const result = parseReelConfig(flat);

  if ("error" in result) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-black px-6 text-center text-white">
        <p className="text-lg">{result.error}</p>
        <Link href="/" className="rounded-full bg-emerald-500 px-5 py-2 text-emerald-950 font-medium">
          Back to setup
        </Link>
      </div>
    );
  }

  return <ReelPlayer config={result.config} />;
}
