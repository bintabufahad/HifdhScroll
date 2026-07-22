"use client";

import { useEffect, useRef } from "react";
import type { CallTile } from "./useDailyCall";

function Tile({ tile }: { tile: CallTile }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const showTrack = tile.screenTrack ?? tile.videoTrack;

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (showTrack) {
      el.srcObject = new MediaStream([showTrack]);
      el.play().catch(() => {});
    } else {
      el.srcObject = null;
    }
  }, [showTrack]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || tile.local) return;
    if (tile.audioTrack) {
      el.srcObject = new MediaStream([tile.audioTrack]);
      el.play().catch(() => {});
    } else {
      el.srcObject = null;
    }
  }, [tile.audioTrack, tile.local]);

  return (
    <div className="relative min-h-0 min-w-0 overflow-hidden rounded-xl border border-white/10 bg-black/60">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={tile.local}
        className={`h-full w-full ${tile.screenTrack ? "object-contain" : "object-cover"}`}
      />
      {!showTrack && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-lg font-semibold text-emerald-200">
            {(tile.userName || "?").charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      {!tile.local && <audio ref={audioRef} autoPlay className="hidden" />}
      <span className="pointer-events-none absolute bottom-1.5 left-1.5 max-w-[80%] truncate rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white/85">
        {tile.userName}
        {tile.local ? " (you)" : ""}
      </span>
    </div>
  );
}

export default function VideoGrid({
  tiles,
  micOn,
  camOn,
  sharing,
  onToggleMic,
  onToggleCam,
  onToggleShare,
}: {
  tiles: CallTile[];
  micOn: boolean;
  camOn: boolean;
  sharing: boolean;
  onToggleMic: () => void;
  onToggleCam: () => void;
  onToggleShare: () => void;
}) {
  const n = tiles.length;
  // Layout to match the reference screenshots: <=2 side-by-side, 3-4 a 2-wide
  // grid, 5+ a 3-wide grid.
  const cols = n <= 1 ? 1 : n <= 4 ? 2 : 3;

  return (
    <div className="flex h-full min-h-0 flex-col gap-1.5">
      <div
        className="grid min-h-0 flex-1 gap-1.5"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridAutoRows: "minmax(0, 1fr)" }}
      >
        {tiles.length === 0 ? (
          <div className="flex items-center justify-center text-sm text-white/50">Connecting…</div>
        ) : (
          tiles.map((t) => <Tile key={t.sessionId} tile={t} />)
        )}
      </div>

      <div className="flex shrink-0 items-center justify-center gap-2">
        <CtrlButton active={micOn} onClick={onToggleMic} label={micOn ? "Mute" : "Unmute"}>
          {micOn ? "🎙️" : "🔇"}
        </CtrlButton>
        <CtrlButton active={camOn} onClick={onToggleCam} label={camOn ? "Camera off" : "Camera on"}>
          {camOn ? "📹" : "🚫"}
        </CtrlButton>
        <CtrlButton active={sharing} onClick={onToggleShare} label="Share screen">
          🖥️
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
