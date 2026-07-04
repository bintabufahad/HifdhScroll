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
      <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-[#e8dcc0] px-6 text-center text-[#3b2a1a]">
        <p className="text-lg">{result.error}</p>
        <Link href="/" className="rounded-full bg-[#7a2e2e] px-5 py-2 text-[#f5ecd7] font-medium">
          Back to setup
        </Link>
      </div>
    );
  }

  return <ReelFeed config={result.config} />;
}
