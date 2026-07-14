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

  const lectureActive = lectureId !== null;

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
    <div className="paper-texture relative flex flex-1 flex-col bg-gradient-to-b from-[#efe4c8] via-[#e8dcc0] to-[#ddcda3] px-4 py-10 sm:px-6">
      <MusicPlayer />
      <CoursePlaylist onPlayLecture={setLectureId} />

      {/* Floating "+points" animation when a session is logged. */}
      {pointsGained !== null && (
        <div className="pointer-events-none fixed left-1/2 top-24 z-50 -translate-x-1/2">
          <span className="points-pop inline-block rounded-full bg-[#7a2e2e] px-4 py-1 font-display text-lg font-bold text-[#f5ecd7] shadow-lg">
            +{pointsGained} pts
          </span>
        </div>
      )}

      <header className="animate-rise-in mx-auto mb-8 w-full max-w-5xl text-center">
        <h1 className="font-display text-4xl font-bold text-[#3b2a1a]">Student of Knowledge</h1>
        <div className="mx-auto mt-3 h-px w-24 bg-[#c9a15d]" />
        <p className="mt-4 text-[#5a4530]">
          A focused study space: a simulated class, your lecture or course, a timer, and your to-do list — all in one
          place.
        </p>
        <p className="mt-2 text-sm text-[#7a5a30]">
          <Link href="/" className="underline underline-offset-2 hover:text-[#7a2e2e]">
            ← Home
          </Link>
        </p>
      </header>

      <div
        className="mx-auto flex w-full flex-col gap-6"
        style={{ maxWidth: lectureActive ? "72rem" : "56rem" }}
      >
        {toast && (
          <p className="animate-rise-in rounded-lg border border-[#c9a15d]/40 bg-[#f5ecd7] px-4 py-2 text-center text-sm text-[#5a4530]">
            {toast}
          </p>
        )}

        <div className="animate-rise-in">
          <GamificationBar stats={stats} />
        </div>

        {lectureActive ? (
          // Lecture playing: the class fills the space, camera sits directly
          // beneath it, and the timer + to-do list go below the camera.
          <>
            <div className="animate-rise-in">
              <LecturePanel lectureId={lectureId} onSetLecture={setLectureId} onClear={() => setLectureId(null)} />
            </div>
            <div className="animate-rise-in mx-auto w-full max-w-sm">
              <CameraSelfView />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="animate-rise-in">
                <StudyTimer onSessionComplete={handleSessionComplete} />
              </div>
              <div className="animate-rise-in">
                <TaskList tasks={tasks} onTasksChange={setTasks} />
              </div>
            </div>
          </>
        ) : (
          // No lecture yet: a compact class + camera row, then timer + to-do.
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="animate-rise-in">
                <LecturePanel lectureId={lectureId} onSetLecture={setLectureId} onClear={() => setLectureId(null)} />
              </div>
              <div className="animate-rise-in">
                <CameraSelfView />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="animate-rise-in">
                <StudyTimer onSessionComplete={handleSessionComplete} />
              </div>
              <div className="animate-rise-in">
                <TaskList tasks={tasks} onTasksChange={setTasks} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
