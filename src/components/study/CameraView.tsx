"use client";

import { useEffect, useRef } from "react";
import type { CameraController } from "./useCamera";

/**
 * Presentational camera self-view driven by a shared CameraController. `big`
 * makes the video fill the available height (for the main lecture-sized slot);
 * otherwise it's a normal aspect-video tile (sidebar). The stream is re-attached
 * on mount, so this can be moved between slots freely.
 */
export default function CameraView({ camera, big = false }: { camera: CameraController; big?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.srcObject = camera.stream;
    if (camera.stream) el.play().catch(() => {});
  }, [camera.stream]);

  return (
    <div className={big ? "flex h-full flex-col" : ""}>
      <div
        className={`relative flex items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/50 ${
          big ? "min-h-0 flex-1" : "aspect-video"
        }`}
      >
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
      </div>

      <div className="mt-3 flex shrink-0 flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={camera.toggleCamera}
          className={`lift rounded-full px-4 py-2 text-sm font-medium transition ${
            camera.cameraOn
              ? "bg-white/10 text-white hover:bg-white/15"
              : "bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
          }`}
        >
          {camera.cameraOn ? "Turn camera off" : "Turn my camera on"}
        </button>

        {camera.cameraOn &&
          (camera.recording ? (
            <button
              type="button"
              onClick={camera.stopRecording}
              className="lift rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
            >
              ■ Stop recording
            </button>
          ) : (
            <button
              type="button"
              onClick={camera.startRecording}
              className="lift rounded-full border border-red-500/60 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-500/10"
            >
              ● Record
            </button>
          ))}
      </div>

      {camera.error && <p className="mt-2 shrink-0 text-center text-xs text-red-300">{camera.error}</p>}

      {camera.recordingUrl && (
        <div className="mt-3 shrink-0 rounded-xl border border-white/10 bg-black/30 p-2">
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

      <p className="mt-2 shrink-0 text-center text-[11px] text-white/40">
        Recording stays only on your device — nothing is uploaded or sent anywhere.
      </p>
    </div>
  );
}
