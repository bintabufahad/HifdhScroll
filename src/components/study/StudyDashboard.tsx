"use client";

import { useState } from "react";
import Link from "next/link";
import LecturePanel from "./LecturePanel";
import CameraSelfView from "./CameraSelfView";
import StudyTimer from "./StudyTimer";
import TaskList from "./TaskList";
import MusicPlayer from "./MusicPlayer";
import CoursePlaylist from "./CoursePlaylist";
import UstadWatcher from "./UstadWatcher";
import type { StudyTask } from "@/lib/types";

export default function StudyDashboard({ initialTasks }: { initialTasks: StudyTask[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [toast, setToast] = useState("");
  const [lectureId, setLectureId] = useState<string | null>(null);

  function handleSessionComplete(seconds: number) {
    const minutes = Math.max(1, Math.round(seconds / 60));
    setToast(`Focus session complete — ${minutes} min. Baarak Allahu feek!`);
    setTimeout(() => setToast(""), 5000);
  }

  return (
    <div className="bg-app-dark relative flex flex-1 flex-col px-3 py-4 sm:px-5">
      <MusicPlayer />
      <CoursePlaylist onPlayLecture={setLectureId} />
      <UstadWatcher />

      {toast && (
        <div className="animate-rise-in fixed left-1/2 top-4 z-50 -translate-x-1/2">
          <span className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-4 py-1.5 text-sm text-emerald-100 backdrop-blur">
            {toast}
          </span>
        </div>
      )}

      <header className="mx-auto mb-3 flex w-full max-w-[1600px] items-center justify-between">
        <Link
          href="/"
          className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70 hover:bg-white/10"
        >
          ← Home
        </Link>
        <h1 className="font-display text-xl font-bold text-white sm:text-2xl">
          Student of <span className="text-emerald-300">Knowledge</span>
        </h1>
        <span className="w-14" />
      </header>

      {/* Desktop: a full-height two-column workspace so nothing needs scrolling
          or fullscreen - the lecture fills the left, and the camera + to-do
          list fill a right column with the (unimportant) timer tucked at the
          bottom corner. Mobile: everything stacks and scrolls. */}
      <main className="mx-auto grid w-full max-w-[1600px] flex-1 grid-cols-1 gap-4 lg:h-[calc(100dvh-6rem)] lg:grid-cols-[minmax(0,1fr)_23rem]">
        <div className="animate-rise-in min-h-0">
          <LecturePanel lectureId={lectureId} onSetLecture={setLectureId} onClear={() => setLectureId(null)} fill />
        </div>

        <aside className="flex min-h-0 flex-col gap-4">
          <div className="animate-rise-in shrink-0">
            <CameraSelfView />
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
