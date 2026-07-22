"use client";

import { useEffect, useRef } from "react";

/**
 * Embeds a Daily.co prebuilt call (free tier, no credit card, no login for
 * anyone; screen-share built in). Leaving the call fires onClose so the class
 * returns to the local camera view.
 */

type DailyFrame = {
  join: (opts: { url: string; userName?: string }) => Promise<unknown>;
  on: (event: string, handler: () => void) => void;
  destroy: () => void;
};

export default function DailyRoom({
  url,
  displayName,
  onClose,
}: {
  url: string;
  displayName?: string;
  onClose?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<DailyFrame | null>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    let frame: DailyFrame | null = null;

    (async () => {
      const container = containerRef.current;
      if (!container) return;
      try {
        const DailyIframe = (await import("@daily-co/daily-js")).default;
        if (cancelled) return;
        frame = DailyIframe.createFrame(container, {
          iframeStyle: { width: "100%", height: "100%", border: "0", borderRadius: "16px" },
          showLeaveButton: true,
          showFullscreenButton: true,
        }) as unknown as DailyFrame;
        frameRef.current = frame;
        frame.on("left-meeting", () => onCloseRef.current?.());
        await frame.join({ url, userName: displayName });
      } catch (err) {
        console.error("Daily call failed to start:", err);
      }
    })();

    return () => {
      cancelled = true;
      try {
        frame?.destroy();
      } catch {
        /* already gone */
      }
      frameRef.current = null;
    };
  }, [url, displayName]);

  return <div ref={containerRef} className="h-full w-full overflow-hidden rounded-2xl bg-black/40" />;
}
