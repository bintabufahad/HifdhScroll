"use client";

import { useState } from "react";
import Link from "next/link";
import MainStage from "./MainStage";
import CameraView from "./CameraView";
import StudyTimer from "./StudyTimer";
import TaskList from "./TaskList";
import CoursePlaylist from "./CoursePlaylist";
import UstadWatcher from "./UstadWatcher";
import { useCamera } from "./useCamera";
import type { CourseItem, StudyTask } from "@/lib/types";

export default function StudyDashboard({
  initialTasks,
  initialCourse,
}: {
  initialTasks: StudyTask[];
  initialCourse: CourseItem[];
}) {
  const [tasks, setTasks] = useState(initialTasks);
  const [toast, setToast] = useState("");
  const [lectureId, setLectureId] = useState<string | null>(null);
  const [courseOpen, setCourseOpen] = useState(false);
  const camera = useCamera();

  function handleSessionComplete(seconds: number) {
    const minutes = Math.max(1, Math.round(seconds / 60));
    setToast(`Focus session complete — ${minutes} min. Baarak Allahu feek!`);
    setTimeout(() => setToast(""), 5000);
  }

  return (
    // Pinned to the viewport height with overflow hidden: the page never
    // scrolls. Every region has a fixed home (no camera/lecture swapping):
    // timer on top, big lecture, live camera, and the planner (to-do).
    <div className="bg-app-dark relative flex h-[100dvh] flex-col overflow-hidden px-2 py-2 sm:px-4 sm:py-3">
      <CoursePlaylist
        open={courseOpen}
        onToggle={() => setCourseOpen((v) => !v)}
        onPlayLecture={(id) => {
          setLectureId(id);
          setCourseOpen(false);
        }}
        initialItems={initialCourse}
      />
      <UstadWatcher enabled={lectureId === null} />

      {toast && (
        <div className="animate-rise-in fixed left-1/2 top-3 z-50 -translate-x-1/2">
          <span className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-4 py-1.5 text-xs text-emerald-100 backdrop-blur sm:text-sm">
            {toast}
          </span>
        </div>
      )}

      {/* pr leaves room for the floating Course button so the title never sits under it. */}
      <header className="mx-auto mb-2 flex w-full max-w-[1600px] shrink-0 items-center gap-2 pr-14 sm:pr-24">
        <Link
          href="/"
          className="lift inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-emerald-950 transition hover:bg-emerald-400 sm:px-4 sm:py-1.5 sm:text-sm"
        >
          ← Home
        </Link>
        <h1 className="truncate font-display text-sm font-bold text-white sm:text-2xl">
          Student of <span className="text-emerald-300">Knowledge</span>
        </h1>
      </header>

      <main className="study-grid mx-auto grid min-h-0 w-full max-w-[1600px] flex-1 gap-2 sm:gap-3">
        {/* Timer (purple) */}
        <div className="area-timer min-w-0">
          <StudyTimer onSessionComplete={handleSessionComplete} />
        </div>

        {/* Lecture (red) */}
        <div className="area-lecture min-h-0 min-w-0">
          <MainStage lectureId={lectureId} onSetLecture={setLectureId} onClear={() => setLectureId(null)} />
        </div>

        {/* Live camera (blue) */}
        <div className="area-camera glass flex min-h-0 min-w-0 flex-col rounded-2xl p-1.5 sm:p-2">
          <CameraView camera={camera} big />
        </div>

        {/* Planner / to-do (orange) */}
        <div className="area-planner flex min-h-0 min-w-0 flex-col">
          <TaskList tasks={tasks} onTasksChange={setTasks} fill />
        </div>
      </main>
    </div>
  );
}
