"use client";

import { useEffect, useRef } from "react";
import type { CameraController } from "./useCamera";
import { useLanguage, type StringKey } from "@/lib/i18n";

/**
 * Presentational camera self-view driven by a shared CameraController. Controls
 * are overlaid on the video (like a real call) so the tile stays compact and
 * the same shape whether it's the big main slot or the small sidebar tile -
 * nothing stacks below to make the layout tall/messy. `big` fills the slot
 * height; otherwise it's an aspect-video tile.
 */
export default function CameraView({ camera, big = false }: { camera: CameraController; big?: boolean }) {
  const { t } = useLanguage();
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
            {t("cameraOff")}
          </span>
        )}
        <span className="pointer-events-none absolute left-2 top-2 rounded bg-black/50 px-2 py-0.5 text-[11px] text-white/80">
          {t("you")}
        </span>
        {camera.recording && (
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-red-600/90 px-2 py-0.5 text-[11px] font-medium text-white">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> REC
          </span>
        )}

        {/* Controls overlaid at the bottom of the video. */}
        <div className="absolute inset-x-0 bottom-2 flex flex-wrap items-center justify-center gap-1.5 px-2">
          <button
            type="button"
            onClick={camera.toggleCamera}
            className={`lift rounded-full px-3 py-1 text-xs font-medium shadow transition ${
              camera.cameraOn ? "bg-white/20 text-white hover:bg-white/30" : "bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
            }`}
          >
            {camera.cameraOn ? t("turnCameraOff") : t("turnCameraOn")}
          </button>
          {camera.cameraOn &&
            (camera.recording ? (
              <button
                type="button"
                onClick={camera.stopRecording}
                className="lift rounded-full bg-red-600 px-3 py-1 text-xs font-medium text-white shadow hover:bg-red-500"
              >
                {t("stopRecording")}
              </button>
            ) : (
              <button
                type="button"
                onClick={camera.startRecording}
                className="lift rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-red-300 shadow hover:bg-black/80"
              >
                {t("record")}
              </button>
            ))}
        </div>
      </div>

      {camera.error && <p className="mt-1.5 text-center text-[11px] text-red-300">{t(camera.error as StringKey)}</p>}

      {camera.recordingUrl && (
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 p-2">
          <video src={camera.recordingUrl} controls className="h-14 rounded" />
          <a
            href={camera.recordingUrl}
            download={`study-session-${new Date().toISOString().slice(0, 19)}.webm`}
            className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-medium text-emerald-950 hover:bg-emerald-400"
          >
            {t("saveRecording")}
          </a>
          <span className="text-[10px] text-white/40">{t("staysOnDevice")}</span>
        </div>
      )}
    </div>
  );
}
