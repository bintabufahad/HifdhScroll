import Link from "next/link";
import { parseReelConfig } from "@/lib/reelConfig";
import ReelFeed from "@/components/ReelFeed";

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
      <div className="bg-app-dark flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center text-white">
        <p className="text-lg">{result.error}</p>
        <Link href="/reels" className="rounded-full bg-emerald-500 px-5 py-2 font-medium text-emerald-950 hover:bg-emerald-400">
          Back to setup
        </Link>
      </div>
    );
  }

  return <ReelFeed config={result.config} />;
}
