"use client";

import { useState } from "react";
import Link from "next/link";
import MainStage, { type StageMode } from "./MainStage";
import CameraView from "./CameraView";
import TeacherBox from "./TeacherBox";
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

  // The big slot shows the lecture if there is one, else the camera (when on),
  // else the placeholder teacher. Whatever isn't in the big slot goes small in
  // the sidebar - so with no lecture and the camera on, you're big and the
  // teacher is small; otherwise the camera is the small sidebar tile.
  const mode: StageMode = lectureId ? "lecture" : camera.cameraOn ? "camera" : "teacher";

  function handleSessionComplete(seconds: number) {
    const minutes = Math.max(1, Math.round(seconds / 60));
    setToast(`Focus session complete — ${minutes} min. Baarak Allahu feek!`);
    setTimeout(() => setToast(""), 5000);
  }

  return (
    <div className="bg-app-dark relative flex flex-1 flex-col px-3 py-4 sm:px-5">
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
        <div className="animate-rise-in fixed left-1/2 top-4 z-50 -translate-x-1/2">
          <span className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-4 py-1.5 text-sm text-emerald-100 backdrop-blur">
            {toast}
          </span>
        </div>
      )}

      {/* pr leaves room for the floating Course button so the title never sits under it. */}
      <header className="mx-auto mb-3 flex w-full max-w-[1600px] items-center gap-3 pr-14 sm:pr-24">
        <Link
          href="/"
          className="lift inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-emerald-950 transition hover:bg-emerald-400 sm:px-4 sm:text-sm"
        >
          ← Home
        </Link>
        <h1 className="truncate font-display text-base font-bold text-white sm:text-2xl">
          Student of <span className="text-emerald-300">Knowledge</span>
        </h1>
      </header>

      <main className="mx-auto grid w-full max-w-[1600px] flex-1 grid-cols-1 gap-3 sm:gap-4 lg:h-[calc(100dvh-6rem)] lg:grid-cols-[minmax(0,1fr)_23rem]">
        <div className="animate-rise-in min-h-0">
          <MainStage
            mode={mode}
            lectureId={lectureId}
            camera={camera}
            onSetLecture={setLectureId}
            onClear={() => setLectureId(null)}
          />
        </div>

        <aside className="flex min-h-0 flex-col gap-4">
          <div className="animate-rise-in glass shrink-0 rounded-2xl p-3">
            {mode === "camera" ? <TeacherBox /> : <CameraView camera={camera} />}
          </div>
          <div className="animate-rise-in flex min-h-0 flex-1 flex-col">
            <TaskList tasks={tasks} onTasksChange={setTasks} fill />
          </div>
          <div className="animate-rise-in shrink-0">
            <StudyTimer onSessionComplete={handleSessionComplete} />
          </div>
        </aside>
      </main>
    </div>
  );
}
