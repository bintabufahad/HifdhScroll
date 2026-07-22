"use client";

import { useState } from "react";
import Link from "next/link";
import MainStage from "./MainStage";
import StudyTimer from "./StudyTimer";
import TaskList from "./TaskList";
import CoursePlaylist from "./CoursePlaylist";
import UstadWatcher from "./UstadWatcher";
import CameraView from "./CameraView";
import JitsiRoom from "./JitsiRoom";
import { useCamera } from "./useCamera";
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
  /** The class owner starts on their own camera; someone opening a shared invite joins the call. */
  isOwner: boolean;
}) {
  const [tasks, setTasks] = useState(initialTasks);
  const [toast, setToast] = useState("");
  const [lectureId, setLectureId] = useState<string | null>(null);
  const [courseOpen, setCourseOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  // "camera" = just your own camera, no Jitsi, no login. "call" = the group
  // video call (Jitsi), started only when you invite people (or when you open
  // someone else's invite link).
  const [mode, setMode] = useState<"camera" | "call">(isOwner ? "camera" : "call");
  const camera = useCamera();

  function handleSessionComplete(seconds: number) {
    const minutes = Math.max(1, Math.round(seconds / 60));
    setToast(`Focus session complete — ${minutes} min. Baarak Allahu feek!`);
    setTimeout(() => setToast(""), 5000);
  }

  async function shareLink() {
    const inviteUrl = `${window.location.origin}/study/class/${studyClass.room}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: studyClass.name, text: "Join my class on Rusookh", url: inviteUrl });
        return;
      }
    } catch {
      // share sheet dismissed - fall through to copy
    }
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setToast("Couldn't share — copy the link from your address bar.");
      setTimeout(() => setToast(""), 4000);
    }
  }

  async function inviteFriends() {
    // Free the camera device so the group call can take it over, then go live.
    if (camera.cameraOn) await camera.toggleCamera();
    setMode("call");
    await shareLink();
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
      />
      <UstadWatcher enabled={lectureId === null} />

      {toast && (
        <div className="animate-rise-in fixed left-1/2 top-3 z-50 -translate-x-1/2">
          <span className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-4 py-1.5 text-xs text-emerald-100 backdrop-blur sm:text-sm">
            {toast}
          </span>
        </div>
      )}

      <header className="mx-auto mb-2 flex w-full max-w-[1600px] shrink-0 items-center gap-2 pr-14 sm:pr-24">
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

        {/* Camera (group call opens in a full-screen overlay below) */}
        <div className="area-camera glass relative flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl p-1.5 sm:p-2">
          {mode === "camera" ? (
            <>
              <button
                type="button"
                onClick={inviteFriends}
                className="lift absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-black/60 px-3 py-1.5 text-xs font-semibold text-emerald-100 backdrop-blur transition hover:bg-black/80"
              >
                👥 Invite friends
              </button>
              <CameraView camera={camera} big />
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <p className="text-sm text-white/70">You&apos;re in the group call.</p>
              <button
                type="button"
                onClick={() => setMode("call")}
                className="lift rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-emerald-950 hover:bg-emerald-400"
              >
                Return to call
              </button>
            </div>
          )}
        </div>

        {/* Planner / to-do */}
        <div className="area-planner flex min-h-0 min-w-0 flex-col">
          <TaskList tasks={tasks} onTasksChange={setTasks} classId={studyClass.id} fill />
        </div>
      </main>

      {/* Full-screen group call: gives Jitsi (and its sign-in prompt) room so
          nothing is cut off. Leaving the call returns to the camera view. */}
      {mode === "call" && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-black">
          <div className="flex shrink-0 items-center justify-between gap-2 bg-black/85 px-3 py-2 sm:px-4">
            <span className="min-w-0 truncate text-sm font-semibold text-emerald-300">
              {studyClass.name} · group call
            </span>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={shareLink}
                className="lift inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-500/20"
              >
                {copied ? "✓ Copied" : "🔗 Invite more"}
              </button>
              <button
                type="button"
                onClick={() => setMode("camera")}
                className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-500"
              >
                Leave call
              </button>
            </div>
          </div>
          <div className="min-h-0 flex-1">
            <JitsiRoom room={studyClass.room} displayName={displayName} onClose={() => setMode("camera")} />
          </div>
        </div>
      )}
    </div>
  );
}
