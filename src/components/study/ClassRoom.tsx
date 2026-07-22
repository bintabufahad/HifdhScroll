"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MainStage from "./MainStage";
import StudyTimer from "./StudyTimer";
import TaskList from "./TaskList";
import CoursePlaylist from "./CoursePlaylist";
import UstadWatcher from "./UstadWatcher";
import CameraView from "./CameraView";
import JitsiRoom, { type JitsiConfig } from "./JitsiRoom";
import VideoGrid from "./VideoGrid";
import Whiteboard from "./Whiteboard";
import { useCamera } from "./useCamera";
import { useDailyCall } from "./useDailyCall";
import type { CourseItem, StudyClass, StudyTask } from "@/lib/types";

type CallConfig = { provider: "daily"; url: string } | ({ provider: "jitsi" } & JitsiConfig);

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
  // "camera" = just your own camera (no call). "call" = the group video call.
  const [mode, setMode] = useState<"camera" | "call">(isOwner ? "camera" : "call");
  const [config, setConfig] = useState<CallConfig | null>(null);
  const [configFailed, setConfigFailed] = useState(false);
  const camera = useCamera();

  // Fetch the call configuration the first time we enter call mode.
  useEffect(() => {
    if (mode !== "call" || config) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/call-token?room=${encodeURIComponent(studyClass.room)}`);
        if (!res.ok) throw new Error("bad status");
        const data = (await res.json()) as CallConfig;
        if (!cancelled) setConfig(data);
      } catch {
        if (!cancelled) setConfigFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, config, studyClass.room]);

  const dailyUrl = mode === "call" && config?.provider === "daily" ? config.url : null;
  const backToCamera = () => {
    setMode("camera");
    setWhiteboardOpen(false);
  };
  const daily = useDailyCall(dailyUrl, displayName, backToCamera);

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
      /* dismissed - fall through to copy */
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
    if (camera.cameraOn) await camera.toggleCamera(); // free the device for the call
    setMode("call");
    await shareLink();
  }

  function leaveCall() {
    daily.leave();
    backToCamera();
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
        <button
          type="button"
          onClick={() => setWhiteboardOpen(true)}
          className="lift inline-flex shrink-0 items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 transition hover:bg-white/10 sm:py-1.5"
        >
          🖊️ <span className="hidden sm:inline">Whiteboard</span>
        </button>
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
          {mode === "call" && (
            <div className="absolute right-3 top-3 z-10 flex gap-1.5">
              <button
                type="button"
                onClick={shareLink}
                className="lift inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-black/60 px-3 py-1.5 text-xs font-semibold text-emerald-100 backdrop-blur transition hover:bg-black/80"
              >
                {copied ? "✓ Copied" : "🔗 Invite"}
              </button>
              <button
                type="button"
                onClick={leaveCall}
                className="lift rounded-full bg-red-600/90 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-red-500"
              >
                Leave
              </button>
            </div>
          )}

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
          ) : config?.provider === "daily" ? (
            <VideoGrid
              tiles={daily.tiles}
              micOn={daily.micOn}
              camOn={daily.camOn}
              sharing={daily.sharing}
              onToggleMic={daily.toggleMic}
              onToggleCam={daily.toggleCam}
              onToggleShare={daily.toggleShare}
            />
          ) : config?.provider === "jitsi" ? (
            <JitsiRoom config={config} displayName={displayName} onClose={backToCamera} />
          ) : configFailed ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-sm text-white/60">
              Couldn&apos;t start the call.
              <button
                type="button"
                onClick={backToCamera}
                className="rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-emerald-950"
              >
                Back to camera
              </button>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-white/60">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-emerald-400" />
              <span className="text-sm">Starting call…</span>
            </div>
          )}
        </div>

        {/* Planner / to-do */}
        <div className="area-planner flex min-h-0 min-w-0 flex-col">
          <TaskList tasks={tasks} onTasksChange={setTasks} classId={studyClass.id} fill />
        </div>
      </main>

      {whiteboardOpen && <Whiteboard call={daily.callObject} onClose={() => setWhiteboardOpen(false)} />}
    </div>
  );
}
