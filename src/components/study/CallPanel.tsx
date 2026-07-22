"use client";

import { useEffect, useState } from "react";
import JitsiRoom, { type JitsiConfig } from "./JitsiRoom";
import DailyRoom from "./DailyRoom";

type CallConfig = ({ provider: "jitsi" } & JitsiConfig) | { provider: "daily"; url: string };

/**
 * Asks the server which video provider to use for this room, then renders it.
 * Daily.co when configured (free, no login), otherwise Jitsi (self-hosted /
 * JaaS / public fallback).
 */
export default function CallPanel({
  room,
  displayName,
  onClose,
}: {
  room: string;
  displayName?: string;
  onClose?: () => void;
}) {
  const [config, setConfig] = useState<CallConfig | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/call-token?room=${encodeURIComponent(room)}`);
        if (!res.ok) throw new Error("bad status");
        const data = (await res.json()) as CallConfig;
        if (!cancelled) setConfig(data);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [room]);

  if (failed) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-sm text-white/60">
        Couldn&apos;t start the call. Please leave and try again.
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-white/60">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-emerald-400" />
        <span className="text-sm">Starting call…</span>
      </div>
    );
  }

  if (config.provider === "daily") {
    return <DailyRoom url={config.url} displayName={displayName} onClose={onClose} />;
  }

  return <JitsiRoom config={config} displayName={displayName} onClose={onClose} />;
}
