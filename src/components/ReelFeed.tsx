"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ReelPlayer from "@/components/ReelPlayer";
import { fetchAyahs } from "@/lib/quranApi";
import { buildReelSegments } from "@/lib/reelSegments";
import type { Ayah, ReelConfig } from "@/lib/types";

export default function ReelFeed({ config }: { config: ReelConfig }) {
  const [ayahs, setAyahs] = useState<Ayah[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reelIndex, setReelIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchAyahs(config)
      .then((data) => {
        if (!cancelled) setAyahs(data);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load this passage. Please check your connection and try again.");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const segments = useMemo(
    () => (ayahs ? buildReelSegments(ayahs, config.mode, config.qaris) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ayahs]
  );

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-[#e8dcc0] px-6 text-center text-[#3b2a1a]">
        <p className="text-lg">{error}</p>
        <Link href="/" className="rounded-full bg-[#7a2e2e] px-5 py-2 text-[#f5ecd7] font-medium">
          Back to setup
        </Link>
      </div>
    );
  }

  if (!ayahs) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#e8dcc0] text-[#5a4530]">Loading passage…</div>
    );
  }

  if (segments.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-[#e8dcc0] px-6 text-center text-[#3b2a1a]">
        <p className="text-lg">No ayahs found for this passage.</p>
        <Link href="/" className="rounded-full bg-[#7a2e2e] px-5 py-2 text-[#f5ecd7] font-medium">
          Back to setup
        </Link>
      </div>
    );
  }

  const segment = segments[reelIndex];
  const goPrevReel = () => setReelIndex((i) => Math.max(0, i - 1));
  const goNextReel = () => setReelIndex((i) => Math.min(segments.length - 1, i + 1));

  return (
    <div className="paper-texture flex flex-1 flex-col items-center gap-4 bg-gradient-to-b from-[#efe4c8] via-[#e8dcc0] to-[#ddcda3] px-4 py-6">
      <header className="flex w-full max-w-2xl items-center justify-between">
        <Link href="/" className="text-sm text-[#7a4a1e] hover:underline">
          ‹ New reels
        </Link>
        <p className="font-display text-sm text-[#5a4530]">
          {segment.ayahs[0]?.surahName} · {segments.length} reels generated
        </p>
      </header>

      <div className="flex flex-1 items-center gap-4">
        <button
          onClick={goPrevReel}
          disabled={reelIndex === 0}
          className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#c9a15d]/50 bg-[#f5ecd7]/60 text-[#5a4530] disabled:opacity-30 sm:flex"
          aria-label="Previous reel"
        >
          ‹
        </button>

        <ReelPlayer
          key={segment.id}
          segment={segment}
          reelIndex={reelIndex}
          totalReels={segments.length}
          onNextReel={goNextReel}
        />

        <button
          onClick={goNextReel}
          disabled={reelIndex === segments.length - 1}
          className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#c9a15d]/50 bg-[#f5ecd7]/60 text-[#5a4530] disabled:opacity-30 sm:flex"
          aria-label="Next reel"
        >
          ›
        </button>
      </div>

      <div className="flex gap-3 sm:hidden">
        <button
          onClick={goPrevReel}
          disabled={reelIndex === 0}
          className="rounded-full border border-[#c9a15d]/50 bg-[#f5ecd7]/60 px-4 py-2 text-sm text-[#5a4530] disabled:opacity-30"
        >
          ‹ Prev reel
        </button>
        <button
          onClick={goNextReel}
          disabled={reelIndex === segments.length - 1}
          className="rounded-full border border-[#c9a15d]/50 bg-[#f5ecd7]/60 px-4 py-2 text-sm text-[#5a4530] disabled:opacity-30"
        >
          Next reel ›
        </button>
      </div>
    </div>
  );
}
