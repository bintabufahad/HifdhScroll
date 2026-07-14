"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import LecturePanel from "./LecturePanel";
import CameraSelfView from "./CameraSelfView";
import StudyTimer from "./StudyTimer";
import TaskList from "./TaskList";
import GamificationBar from "./GamificationBar";
import MusicPlayer from "./MusicPlayer";
import CoursePlaylist from "./CoursePlaylist";
import UstadWatcher from "./UstadWatcher";
import type { ProfileStats, StudyTask } from "@/lib/types";

export default function StudyDashboard({
  initialStats,
  initialTasks,
}: {
  initialStats: ProfileStats;
  initialTasks: StudyTask[];
}) {
  const [stats, setStats] = useState(initialStats);
  const [tasks, setTasks] = useState(initialTasks);
  const [toast, setToast] = useState("");
  const [pointsGained, setPointsGained] = useState<number | null>(null);
  const [lectureId, setLectureId] = useState<string | null>(null);

  async function handleSessionComplete(seconds: number) {
    const supabase = createClient();
    const prevPoints = stats.points;
    const { data, error } = await supabase.rpc("record_study_session", { p_duration_seconds: seconds });
    if (!error && data) {
      const next = data as ProfileStats;
      setStats(next);
      const gained = next.points - prevPoints;
      if (gained > 0) {
        setPointsGained(gained);
        setTimeout(() => setPointsGained(null), 1600);
      }
      const minutes = Math.round(seconds / 60);
      setToast(`Session logged: ${minutes} min. Points and streak updated.`);
      setTimeout(() => setToast(""), 5000);
    }
  }

  return (
    <div className="bg-app-dark relative flex flex-1 flex-col px-4 py-6 sm:px-6">
      <MusicPlayer />
      <CoursePlaylist onPlayLecture={setLectureId} />
      <UstadWatcher />

      {pointsGained !== null && (
        <div className="pointer-events-none fixed left-1/2 top-24 z-50 -translate-x-1/2">
          <span className="points-pop inline-block rounded-full bg-emerald-500 px-4 py-1 font-display text-lg font-bold text-emerald-950 shadow-lg">
            +{pointsGained} pts
          </span>
        </div>
      )}

      <header className="animate-rise-in mx-auto mb-5 w-full max-w-6xl text-center">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70 hover:bg-white/10"
          >
            ← Home
          </Link>
          <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
            Student of <span className="text-emerald-300">Knowledge</span>
          </h1>
          <span className="w-14" />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        {toast && (
          <p className="animate-rise-in rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-center text-sm text-emerald-100">
            {toast}
          </p>
        )}

        <div className="animate-rise-in">
          <GamificationBar stats={stats} />
        </div>

        {/* Lecture on the left; camera + timer + to-do stacked on the right so
            they stay in view without scrolling. Stacks on smaller screens. */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <div className="animate-rise-in">
            <LecturePanel lectureId={lectureId} onSetLecture={setLectureId} onClear={() => setLectureId(null)} />
          </div>
          <div className="flex flex-col gap-5">
            <div className="animate-rise-in">
              <CameraSelfView />
            </div>
            <div className="animate-rise-in">
              <StudyTimer onSessionComplete={handleSessionComplete} />
            </div>
            <div className="animate-rise-in">
              <TaskList tasks={tasks} onTasksChange={setTasks} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
