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

  // Big slot = lecture if there is one, else the camera (when on), else the
  // placeholder teacher. Whatever isn't in the big slot becomes the small tile.
  const mode: StageMode = lectureId ? "lecture" : camera.cameraOn ? "camera" : "teacher";

  function handleSessionComplete(seconds: number) {
    const minutes = Math.max(1, Math.round(seconds / 60));
    setToast(`Focus session complete — ${minutes} min. Baarak Allahu feek!`);
    setTimeout(() => setToast(""), 5000);
  }

  return (
    // Fixed to the viewport height with overflow hidden: the dashboard never
    // scrolls the page - the to-do list scrolls inside its own card instead.
    <div className="bg-app-dark relative flex h-[100dvh] flex-col overflow-hidden px-3 py-2 sm:px-5 sm:py-3">
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

      {/* Two columns at every size: STUDY (timer + to-do) and VIDEO (a compact
          lecture/camera + the small secondary tile). On phone/tablet-portrait
          study is on the left and the smaller video on the right; landscape and
          desktop flip so the big video is on the left and study on the right. */}
      <main className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-row gap-2 sm:gap-4">
        {/* Study column */}
        <aside className="flex min-h-0 min-w-0 basis-[56%] flex-col gap-2 sm:basis-[55%] sm:gap-3 lg:order-2 lg:basis-[22rem] lg:shrink-0">
          <div className="animate-rise-in shrink-0">
            <StudyTimer onSessionComplete={handleSessionComplete} />
          </div>
          <div className="animate-rise-in flex min-h-0 flex-1 flex-col">
            <TaskList tasks={tasks} onTasksChange={setTasks} fill />
          </div>
        </aside>

        {/* Video column */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center gap-2 sm:gap-3 lg:order-1 lg:justify-start">
          <div className="animate-rise-in min-h-0 lg:flex-1">
            <MainStage
              mode={mode}
              lectureId={lectureId}
              camera={camera}
              onSetLecture={setLectureId}
              onClear={() => setLectureId(null)}
            />
          </div>
          {/* Secondary tile: whichever of camera/teacher isn't in the big slot -
              kept clearly small and to the right. */}
          <div className="animate-rise-in glass w-1/2 self-end rounded-2xl p-1.5 sm:p-2 lg:w-3/5">
            {mode === "camera" ? <TeacherBox /> : <CameraView camera={camera} />}
          </div>
        </div>
      </main>
    </div>
  );
}
