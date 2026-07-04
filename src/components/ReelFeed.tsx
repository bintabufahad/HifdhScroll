"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ReelPlayer from "@/components/ReelPlayer";
import { fetchAyahs } from "@/lib/quranApi";
import { buildReelSegments } from "@/lib/reelSegments";
import type { Ayah, ReelConfig } from "@/lib/types";

export default function ReelFeed({ config }: { config: ReelConfig }) {
  const [ayahs, setAyahs] = useState<Ayah[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  const segments = useMemo(() => (ayahs ? buildReelSegments(ayahs, config.qaris) : []), [ayahs, config.qaris]);

  useEffect(() => {
    if (segments.length === 0) return;
    // Track every observed section's latest ratio (not just ones touched by the
    // current callback batch) so the active reel can move in either direction
    // as the user scrolls, instead of getting stuck on the first one to hit 100%.
    const ratios = new Map<number, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const idx = Number((entry.target as HTMLElement).dataset.index);
          ratios.set(idx, entry.intersectionRatio);
        }
        let bestIdx = 0;
        let bestRatio = 0;
        ratios.forEach((ratio, idx) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestIdx = idx;
          }
        });
        if (bestRatio > 0.4) setActiveIndex(bestIdx);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    sectionRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [segments.length]);

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

  return (
    <div className="relative h-dvh w-full snap-y snap-mandatory overflow-y-scroll bg-black">
      <Link
        href="/"
        className="fixed left-4 top-4 z-20 rounded-full bg-black/40 px-3 py-1.5 text-sm text-white backdrop-blur"
      >
        ‹ New reels
      </Link>
      <div className="fixed right-4 top-4 z-20 rounded-full bg-black/40 px-3 py-1.5 text-xs text-white backdrop-blur">
        {activeIndex + 1} / {segments.length}
      </div>

      {segments.map((segment, i) => (
        <div
          key={segment.id}
          ref={(el) => {
            sectionRefs.current[i] = el;
          }}
          data-index={i}
          className="flex h-dvh w-full snap-start snap-always items-center justify-center"
        >
          {Math.abs(i - activeIndex) <= 1 ? (
            <ReelPlayer segment={segment} isActive={i === activeIndex} />
          ) : (
            <div className="h-full w-full" />
          )}
        </div>
      ))}
    </div>
  );
}
