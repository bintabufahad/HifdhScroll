"use client";

import { useEffect, useRef } from "react";
import type { CameraController } from "./useCamera";

/**
 * Presentational camera self-view driven by a shared CameraController. In `big`
 * mode it fills the slot exactly like the lecture iframe, with the controls
 * overlaid on the video (so nothing pushes below the fold). In normal mode it's
 * an aspect-video tile with the controls beneath it. The stream is re-attached
 * on mount, so this can move between slots freely.
 */
export default function CameraView({ camera, big = false }: { camera: CameraController; big?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.srcObject = camera.stream;
    if (camera.stream) el.play().catch(() => {});
  }, [camera.stream]);

  const controls = (
    <>
      <button
        type="button"
        onClick={camera.toggleCamera}
        className={`lift rounded-full px-3 py-1.5 text-xs font-medium transition ${
          camera.cameraOn ? "bg-white/15 text-white hover:bg-white/25" : "bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
        }`}
      >
        {camera.cameraOn ? "Camera off" : "Turn my camera on"}
      </button>
      {camera.cameraOn &&
        (camera.recording ? (
          <button
            type="button"
            onClick={camera.stopRecording}
            className="lift rounded-full bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500"
          >
            ■ Stop
          </button>
        ) : (
          <button
            type="button"
            onClick={camera.startRecording}
            className="lift rounded-full border border-red-500/70 bg-black/40 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/20"
          >
            ● Record
          </button>
        ))}
    </>
  );

  const videoTile = (
    <div className={`relative overflow-hidden rounded-xl border border-white/10 bg-black/50 ${big ? "h-full w-full" : "aspect-video"}`}>
      <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
      {!camera.cameraOn && (
        <span className="absolute inset-0 flex items-center justify-center px-3 text-center text-sm text-white/40">
          Camera off
        </span>
      )}
      <span className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/50 px-2 py-0.5 text-xs text-white/80">
        You
      </span>
      {camera.recording && (
        <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-red-600/90 px-2 py-0.5 text-xs font-medium text-white">
          <span className="h-2 w-2 animate-pulse rounded-full bg-white" /> REC
        </span>
      )}

      {/* In big mode the controls float on the video so the tile stays the same
          height as a lecture (everything in one view, no scrolling). */}
      {big && (
        <div className="absolute inset-x-0 bottom-2 flex flex-wrap items-center justify-center gap-2 px-2">
          {controls}
          {camera.recordingUrl && (
            <a
              href={camera.recordingUrl}
              download={`study-session-${new Date().toISOString().slice(0, 19)}.webm`}
              className="rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-medium text-emerald-950 hover:bg-emerald-400"
            >
              ↓ Save recording
            </a>
          )}
        </div>
      )}
    </div>
  );

  if (big) {
    return <div className="h-full w-full">{videoTile}</div>;
  }

  return (
    <div>
      {videoTile}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">{controls}</div>
      {camera.error && <p className="mt-2 text-center text-xs text-red-300">{camera.error}</p>}
      {camera.recordingUrl && (
        <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-2">
          <p className="mb-2 text-center text-xs text-emerald-200/80">Your recording (stays on this device)</p>
          <video src={camera.recordingUrl} controls className="max-h-40 w-full rounded-lg" />
          <a
            href={camera.recordingUrl}
            download={`study-session-${new Date().toISOString().slice(0, 19)}.webm`}
            className="mt-2 block rounded-full bg-emerald-500 py-1.5 text-center text-sm font-medium text-emerald-950 hover:bg-emerald-400"
          >
            ↓ Download recording
          </a>
        </div>
      )}
      <p className="mt-2 text-center text-[11px] text-white/40">
        Recording stays only on your device — nothing is uploaded or sent anywhere.
      </p>
    </div>
  );
}
