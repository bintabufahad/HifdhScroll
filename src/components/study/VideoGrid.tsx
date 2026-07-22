"use client";

import { useEffect, useRef } from "react";
import type { CallTile } from "./useWebRTCCall";

function Tile({ tile }: { tile: CallTile }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.srcObject = tile.stream;
    if (tile.stream) el.play().catch(() => {});
  }, [tile.stream]);

  const hasVideo = !!tile.stream && tile.stream.getVideoTracks().some((t) => t.enabled);

  return (
    <div className="relative min-h-0 min-w-0 overflow-hidden rounded-xl border border-white/10 bg-black/60">
      <video ref={videoRef} autoPlay playsInline muted={tile.local} className="h-full w-full object-cover" />
      {!hasVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-lg font-semibold text-emerald-200">
            {(tile.name || "?").charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <span className="pointer-events-none absolute bottom-1.5 left-1.5 max-w-[85%] truncate rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white/85">
        {tile.name}
        {tile.local ? " (you)" : ""}
      </span>
    </div>
  );
}

export default function VideoGrid({
  tiles,
  micOn,
  camOn,
  onToggleMic,
  onToggleCam,
}: {
  tiles: CallTile[];
  micOn: boolean;
  camOn: boolean;
  onToggleMic: () => void;
  onToggleCam: () => void;
}) {
  const n = tiles.length;
  // Match the reference screenshots (and the narrow camera panel on every
  // device): solo fills the frame; 2 sit side-by-side; 3-4 make a 2x2; 5+ keep
  // two columns and grow downward (2x3, …).
  const cols = n <= 1 ? 1 : 2;

  return (
    <div className="flex h-full min-h-0 flex-col gap-1.5">
      <div
        className="grid min-h-0 flex-1 gap-1.5"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridAutoRows: "minmax(0, 1fr)" }}
      >
        {tiles.map((t) => (
          <Tile key={t.id} tile={t} />
        ))}
      </div>

      <div className="flex shrink-0 items-center justify-center gap-2">
        <CtrlButton active={micOn} onClick={onToggleMic} label={micOn ? "Mute" : "Unmute"}>
          {micOn ? "🎙️" : "🔇"}
        </CtrlButton>
        <CtrlButton active={camOn} onClick={onToggleCam} label={camOn ? "Turn camera off" : "Turn camera on"}>
          {camOn ? "📹" : "🚫"}
        </CtrlButton>
      </div>
    </div>
  );
}

function CtrlButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm transition ${
        active ? "bg-white/15 hover:bg-white/25" : "bg-red-600/80 hover:bg-red-500"
      }`}
    >
      {children}
    </button>
  );
}
