"use client";

import { useState } from "react";
import Link from "next/link";
import MainStage from "./MainStage";
import StudyTimer from "./StudyTimer";
import TaskList from "./TaskList";
import CoursePlaylist from "./CoursePlaylist";
import UstadWatcher from "./UstadWatcher";
import CameraView from "./CameraView";
import VideoGrid from "./VideoGrid";
import Whiteboard from "./Whiteboard";
import { useCamera } from "./useCamera";
import { useWebRTCCall } from "./useWebRTCCall";
import type { CourseItem, StudyClass, StudyTask } from "@/lib/types";

export default function ClassRoom({
  studyClass,
  initialTasks,
  initialCourse,
  displayName,
  isOwner,
}: {
  studyClass: StudyClass;
  initialTasks: StudyTask[];
  initialCourse: CourseItem[];
  displayName?: string;
  isOwner: boolean;
}) {
  const [tasks, setTasks] = useState(initialTasks);
  const [toast, setToast] = useState("");
  const [lectureId, setLectureId] = useState<string | null>(null);
  const [courseOpen, setCourseOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);
  // "camera" = just your own camera. "call" = the live peer-to-peer group call.
  const [mode, setMode] = useState<"camera" | "call">(isOwner ? "camera" : "call");
  const camera = useCamera();

  function flashToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 4500);
  }

  const call = useWebRTCCall(mode === "call" ? studyClass.room : null, displayName, (msg) => {
    flashToast(msg);
    setMode("camera");
    setWhiteboardOpen(false);
  });

  function handleSessionComplete(seconds: number) {
    const minutes = Math.max(1, Math.round(seconds / 60));
    flashToast(`Focus session complete — ${minutes} min. Baarak Allahu feek!`);
  }

  async function shareLink() {
    const inviteUrl = `${window.location.origin}/study/class/${studyClass.room}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: studyClass.name, text: "Join my class on Rusookh", url: inviteUrl });
        return;
      }
    } catch {
      /* dismissed - fall through to copy */
    }
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      flashToast("Couldn't share — copy the link from your address bar.");
    }
  }

  async function inviteFriends() {
    if (camera.cameraOn) await camera.toggleCamera(); // free the device for the call
    setMode("call");
    await shareLink();
  }

  async function joinCall() {
    if (camera.cameraOn) await camera.toggleCamera();
    setMode("call");
  }

  return (
    <div className="bg-app-dark relative flex h-[100dvh] flex-col overflow-hidden px-2 py-2 sm:px-4 sm:py-3">
      <CoursePlaylist
        open={courseOpen}
        onToggle={() => setCourseOpen((v) => !v)}
        onPlayLecture={(id) => {
          setLectureId(id);
          setCourseOpen(false);
        }}
        initialItems={initialCourse}
        classId={studyClass.id}
        onOpenWhiteboard={() => setWhiteboardOpen(true)}
      />
      <UstadWatcher enabled={lectureId === null} />

      {toast && (
        <div className="animate-rise-in fixed left-1/2 top-3 z-50 -translate-x-1/2">
          <span className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-4 py-1.5 text-xs text-emerald-100 backdrop-blur sm:text-sm">
            {toast}
          </span>
        </div>
      )}

      <header className="mx-auto mb-2 flex w-full max-w-[1600px] shrink-0 items-center gap-2 pr-24 sm:pr-40">
        <Link
          href="/study"
          className="lift inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-emerald-950 transition hover:bg-emerald-400 sm:px-4 sm:py-1.5 sm:text-sm"
        >
          ← Classes
        </Link>
        <h1 className="min-w-0 flex-1 truncate font-display text-sm font-bold text-white sm:text-2xl">
          <span className="text-emerald-300">{studyClass.name}</span>
        </h1>
      </header>

      <main className="study-grid mx-auto grid min-h-0 w-full max-w-[1600px] flex-1 gap-2 sm:gap-3">
        {/* Timer */}
        <div className="area-timer min-w-0">
          <StudyTimer onSessionComplete={handleSessionComplete} />
        </div>

        {/* Lecture */}
        <div className="area-lecture min-h-0 min-w-0">
          <MainStage lectureId={lectureId} onSetLecture={setLectureId} onClear={() => setLectureId(null)} />
        </div>

        {/* Camera panel — the call replaces ONLY this panel. */}
        <div className="area-camera glass relative flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl p-1.5 sm:p-2">
          {mode === "camera" ? (
            <>
              <button
                type="button"
                onClick={isOwner ? inviteFriends : joinCall}
                className="lift absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-black/60 px-3 py-1.5 text-xs font-semibold text-emerald-100 backdrop-blur transition hover:bg-black/80"
              >
                {isOwner ? "👥 Invite friends" : "📹 Join call"}
              </button>
              <CameraView camera={camera} big />
            </>
          ) : (
            <>
              <div className="absolute right-3 top-3 z-10 flex gap-1.5">
                {isOwner && (
                  <button
                    type="button"
                    onClick={shareLink}
                    className="lift inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-black/60 px-3 py-1.5 text-xs font-semibold text-emerald-100 backdrop-blur transition hover:bg-black/80"
                  >
                    {copied ? "✓ Copied" : "🔗 Invite"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setMode("camera")}
                  className="lift rounded-full bg-red-600/90 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-red-500"
                >
                  Leave
                </button>
              </div>
              <VideoGrid
                tiles={call.tiles}
                micOn={call.micOn}
                camOn={call.camOn}
                onToggleMic={call.toggleMic}
                onToggleCam={call.toggleCam}
              />
            </>
          )}
        </div>

        {/* Planner / to-do */}
        <div className="area-planner flex min-h-0 min-w-0 flex-col">
          <TaskList tasks={tasks} onTasksChange={setTasks} classId={studyClass.id} fill />
        </div>
      </main>

      {whiteboardOpen && (
        <Whiteboard bus={call.whiteboardBus} send={call.sendWhiteboard} onClose={() => setWhiteboardOpen(false)} />
      )}
    </div>
  );
}
