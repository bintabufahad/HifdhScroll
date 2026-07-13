"use client";

import { useEffect, useRef, useState } from "react";
import { extractYouTubeId } from "@/lib/youtube";

/**
 * A simulated "video call" - the main panel is either a static placeholder
 * teacher OR, once the user pastes a lecture link, the lecture video itself
 * playing in the teacher's place; alongside it is the user's own camera
 * self-view. Studying alone this way still feels like sitting in a class and
 * staying on-camera, without actually connecting to anyone. Clearly labeled
 * throughout as a focus tool, not a real call.
 */
export default function FakeVideoCall() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkInput, setLinkInput] = useState("");
  const [lectureId, setLectureId] = useState<string | null>(null);
  const [linkError, setLinkError] = useState("");

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

    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraOn(true);
    } catch {
      setCameraError("Camera access was denied or unavailable. You can still study without it.");
    }
  }

  function loadLecture(e: React.FormEvent) {
    e.preventDefault();
    const id = extractYouTubeId(linkInput);
    if (!id) {
      setLinkError("That doesn't look like a YouTube link. Paste a full youtube.com or youtu.be URL.");
      return;
    }
    setLinkError("");
    setLectureId(id);
    setShowLinkInput(false);
  }

  function clearLecture() {
    setLectureId(null);
    setLinkInput("");
  }

  return (
    <div className="rounded-2xl border border-[#c9a15d]/40 bg-[#faf3e2] p-4">
      <p className="mb-3 text-center text-xs font-medium uppercase tracking-widest text-[#7a5a30]">
        Simulated study call — not a real class, no one else is on this call
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr]">
        {/* Teacher / lecture panel */}
        <div className="relative flex aspect-video flex-col items-center justify-center overflow-hidden rounded-xl border border-[#c9a15d]/30 bg-[#3b2a1a]">
          {lectureId ? (
            <iframe
              key={lectureId}
              src={`https://www.youtube-nocookie.com/embed/${lectureId}`}
              title="Lecture"
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <TeacherAvatar />
          )}

          <span className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/40 px-2 py-0.5 text-xs text-[#f5ecd7]">
            {lectureId ? "Lecture" : "“Teacher” (demo)"}
          </span>

          {/* Controls on the teacher panel: add / change / remove the lecture */}
          <div className="absolute right-2 top-2 flex gap-1">
            <button
              type="button"
              onClick={() => setShowLinkInput((v) => !v)}
              className="rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-[#f5ecd7] hover:bg-black/70"
            >
              {lectureId ? "Change lecture" : "▶ Add lecture link"}
            </button>
            {lectureId && (
              <button
                type="button"
                onClick={clearLecture}
                className="rounded-full bg-black/50 px-2 py-1 text-xs font-medium text-[#f5ecd7] hover:bg-black/70"
                aria-label="Remove lecture"
              >
                ✕
              </button>
            )}
          </div>

          {showLinkInput && (
            <form
              onSubmit={loadLecture}
              className="absolute inset-x-2 top-11 flex flex-col gap-2 rounded-lg bg-black/70 p-2"
            >
              <input
                type="url"
                autoFocus
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                placeholder="Paste a YouTube lecture link…"
                className="rounded border border-[#c9a15d]/40 bg-white/90 px-2 py-1 text-xs text-[#3b2a1a] outline-none"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded bg-[#7a2e2e] px-2 py-1 text-xs font-medium text-[#f5ecd7] hover:bg-[#8a3a3a]"
                >
                  Play here
                </button>
                <button
                  type="button"
                  onClick={() => setShowLinkInput(false)}
                  className="rounded bg-white/20 px-2 py-1 text-xs text-[#f5ecd7] hover:bg-white/30"
                >
                  Cancel
                </button>
              </div>
              {linkError && <p className="text-xs text-red-300">{linkError}</p>}
            </form>
          )}
        </div>

        {/* User camera self-view */}
        <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-[#c9a15d]/30 bg-[#2a2015]">
          {cameraOn ? (
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
          ) : (
            <span className="px-3 text-center text-sm text-[#c9a15d]">Camera off</span>
          )}
          <span className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/40 px-2 py-0.5 text-xs text-[#f5ecd7]">
            You
          </span>
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
        {cameraError && <p className="text-xs text-red-800">{cameraError}</p>}
        <p className="text-center text-xs text-[#7a5a30]">
          Seeing yourself on camera, like in a real class, can help you stay focused. Nothing from your camera is
          recorded or sent anywhere.
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
