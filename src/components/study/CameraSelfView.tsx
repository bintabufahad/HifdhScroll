"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The user's own camera self-view, with optional local recording. The <video>
 * element is always mounted so the stream attaches reliably. Recording uses the
 * MediaRecorder API and stays entirely on the device - the clip is held in
 * memory as a blob the user can play back or download; it is never uploaded or
 * sent anywhere.
 */
export default function CameraSelfView({ className = "" }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [cameraOn, setCameraOn] = useState(false);
  const [error, setError] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (recordingUrl) URL.revokeObjectURL(recordingUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggleCamera() {
    if (cameraOn) {
      if (recording) stopRecording();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      setCameraOn(false);
      return;
    }

    setError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("This browser can't access the camera. Try a different browser, or study without it.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraOn(true);
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError") {
        setError("Camera permission was blocked. Allow it in your browser's site settings, then try again.");
      } else if (name === "NotFoundError") {
        setError("No camera was found on this device.");
      } else {
        setError("Couldn't start the camera. You can still study without it.");
      }
    }
  }

  function startRecording() {
    if (!streamRef.current || typeof MediaRecorder === "undefined") {
      setError("Recording isn't supported in this browser.");
      return;
    }
    if (recordingUrl) {
      URL.revokeObjectURL(recordingUrl);
      setRecordingUrl(null);
    }
    chunksRef.current = [];
    try {
      const recorder = new MediaRecorder(streamRef.current);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: chunksRef.current[0]?.type || "video/webm" });
        setRecordingUrl(URL.createObjectURL(blob));
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch {
      setError("Couldn't start recording on this device.");
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setRecording(false);
  }

  return (
    <div className={`glass rounded-2xl p-4 ${className}`}>
      <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/40">
        <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
        {!cameraOn && (
          <span className="absolute inset-0 flex items-center justify-center px-3 text-center text-sm text-white/40">
            Camera off
          </span>
        )}
        <span className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/50 px-2 py-0.5 text-xs text-white/80">
          You
        </span>
        {recording && (
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-red-600/90 px-2 py-0.5 text-xs font-medium text-white">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" /> REC
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={toggleCamera}
          className={`lift rounded-full px-4 py-2 text-sm font-medium transition ${
            cameraOn
              ? "bg-white/10 text-white hover:bg-white/15"
              : "bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
          }`}
        >
          {cameraOn ? "Turn camera off" : "Turn my camera on"}
        </button>

        {cameraOn &&
          (recording ? (
            <button
              type="button"
              onClick={stopRecording}
              className="lift rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
            >
              ■ Stop recording
            </button>
          ) : (
            <button
              type="button"
              onClick={startRecording}
              className="lift rounded-full border border-red-500/60 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-500/10"
            >
              ● Record
            </button>
          ))}
      </div>

      {error && <p className="mt-2 text-center text-xs text-red-300">{error}</p>}

      {recordingUrl && (
        <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-2">
          <p className="mb-2 text-center text-xs text-emerald-200/80">Your recording (stays on this device)</p>
          <video src={recordingUrl} controls className="w-full rounded-lg" />
          <a
            href={recordingUrl}
            download={`study-session-${new Date().toISOString().slice(0, 19)}.webm`}
            className="mt-2 block rounded-full bg-emerald-500 py-2 text-center text-sm font-medium text-emerald-950 hover:bg-emerald-400"
          >
            ↓ Download recording
          </a>
        </div>
      )}

      <p className="mt-3 text-center text-xs text-white/45">
        Seeing (and recording) yourself, like in a real class, helps you stay focused. Nothing is uploaded or sent
        anywhere — recordings live only on your device.
      </p>
    </div>
  );
}
