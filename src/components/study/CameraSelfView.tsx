"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The user's own camera self-view. The <video> element is always mounted (just
 * visually hidden when off) so the stream can attach to it reliably - the old
 * version set srcObject before the element existed, which is why the camera
 * "didn't work". Camera is opt-in and the stream is only ever shown locally;
 * nothing is uploaded or recorded.
 */
export default function CameraSelfView({ className = "" }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function toggleCamera() {
    if (cameraOn) {
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
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      // The element is always mounted, so this attaches reliably.
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

  return (
    <div className={`rounded-2xl border border-[#c9a15d]/40 bg-[#faf3e2] p-4 ${className}`}>
      <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-[#c9a15d]/30 bg-[#2a2015]">
        {/* Always mounted so the stream attaches reliably; overlay covers it when off. */}
        <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
        {!cameraOn && (
          <span className="absolute inset-0 flex items-center justify-center px-3 text-center text-sm text-[#c9a15d]">
            Camera off
          </span>
        )}
        <span className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/40 px-2 py-0.5 text-xs text-[#f5ecd7]">
          You
        </span>
      </div>

      <div className="mt-3 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={toggleCamera}
          className={`lift rounded-full px-4 py-2 text-sm font-medium transition ${
            cameraOn
              ? "bg-[#7a2e2e] text-[#f5ecd7] hover:bg-[#8a3a3a]"
              : "border border-[#c9a15d]/50 bg-[#f5ecd7] text-[#5a4530] hover:bg-[#efe4c8]"
          }`}
        >
          {cameraOn ? "Turn camera off" : "Turn my camera on"}
        </button>
        {error && <p className="text-center text-xs text-red-800">{error}</p>}
        <p className="text-center text-xs text-[#7a5a30]">
          Seeing yourself on camera, like in a real class, helps you stay focused. Nothing is recorded or sent anywhere.
        </p>
      </div>
    </div>
  );
}
