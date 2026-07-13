"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A simulated "video call" - a static placeholder teacher panel next to the
 * user's own camera self-view - so studying alone still feels like sitting
 * in a class and staying on-camera, without actually connecting to anyone.
 * Clearly labeled throughout as a focus tool, not a real call, so it's never
 * mistaken for an actual class or teacher.
 */
export default function FakeVideoCall() {
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
      setCameraOn(false);
      return;
    }

    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraOn(true);
    } catch {
      setError("Camera access was denied or unavailable. You can still study without it.");
    }
  }

  return (
    <div className="rounded-2xl border border-[#c9a15d]/40 bg-[#faf3e2] p-4">
      <p className="mb-3 text-center text-xs font-medium uppercase tracking-widest text-[#7a5a30]">
        Simulated study call — not a real class, no one else is on this call
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="relative flex aspect-video flex-col items-center justify-center overflow-hidden rounded-xl border border-[#c9a15d]/30 bg-[#3b2a1a]">
          <TeacherAvatar />
          <span className="absolute bottom-2 left-2 rounded bg-black/40 px-2 py-0.5 text-xs text-[#f5ecd7]">
            &ldquo;Teacher&rdquo; (demo)
          </span>
        </div>
        <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-[#c9a15d]/30 bg-[#2a2015]">
          {cameraOn ? (
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
          ) : (
            <span className="px-3 text-center text-sm text-[#c9a15d]">Camera off</span>
          )}
          <span className="absolute bottom-2 left-2 rounded bg-black/40 px-2 py-0.5 text-xs text-[#f5ecd7]">You</span>
        </div>
      </div>

      <div className="mt-3 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={toggleCamera}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            cameraOn
              ? "bg-[#7a2e2e] text-[#f5ecd7] hover:bg-[#8a3a3a]"
              : "border border-[#c9a15d]/50 bg-[#f5ecd7] text-[#5a4530] hover:bg-[#efe4c8]"
          }`}
        >
          {cameraOn ? "Turn camera off" : "Turn my camera on"}
        </button>
        {error && <p className="text-xs text-red-800">{error}</p>}
        <p className="text-center text-xs text-[#7a5a30]">
          Seeing yourself on camera, like in a real class, can help you stay focused and avoid distractions. Nothing
          from your camera is recorded or sent anywhere.
        </p>
      </div>
    </div>
  );
}

function TeacherAvatar() {
  return (
    <svg viewBox="0 0 100 100" className="h-16 w-16 text-[#c9a15d]" fill="none">
      <circle cx="50" cy="35" r="18" fill="currentColor" opacity="0.85" />
      <path d="M20 90c0-18 13.5-32 30-32s30 14 30 32" fill="currentColor" opacity="0.85" />
    </svg>
  );
}
