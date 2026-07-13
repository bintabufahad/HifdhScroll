"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import FakeVideoCall from "./FakeVideoCall";
import LectureEmbed from "./LectureEmbed";
import StudyTimer from "./StudyTimer";
import TaskList from "./TaskList";
import GamificationBar from "./GamificationBar";
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

  async function handleSessionComplete(seconds: number) {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("record_study_session", { p_duration_seconds: seconds });
    if (!error && data) {
      setStats(data as ProfileStats);
      const minutes = Math.round(seconds / 60);
      setToast(`Session logged: ${minutes} min. Points and streak updated.`);
      setTimeout(() => setToast(""), 5000);
    }
  }

  return (
    <div className="paper-texture flex flex-1 flex-col bg-gradient-to-b from-[#efe4c8] via-[#e8dcc0] to-[#ddcda3] px-6 py-10">
      <header className="mx-auto mb-8 w-full max-w-4xl text-center">
        <h1 className="font-display text-4xl font-bold text-[#3b2a1a]">Student of Knowledge</h1>
        <div className="mx-auto mt-3 h-px w-24 bg-[#c9a15d]" />
        <p className="mt-4 text-[#5a4530]">
          A quiet, focused study space: a simulated class setup, your lecture, a timer, and your to-do list — all in
          one place.
        </p>
        <p className="mt-2 text-sm text-[#7a5a30]">
          <Link href="/" className="underline underline-offset-2 hover:text-[#7a2e2e]">
            ← Back to reels
          </Link>
        </p>
      </header>

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        {toast && (
          <p className="rounded-lg border border-[#c9a15d]/40 bg-[#f5ecd7] px-4 py-2 text-center text-sm text-[#5a4530]">
            {toast}
          </p>
        )}

        <GamificationBar stats={stats} />
        <FakeVideoCall />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <LectureEmbed />
          <div className="flex flex-col gap-6">
            <StudyTimer onSessionComplete={handleSessionComplete} />
          </div>
        </div>

        <TaskList tasks={tasks} onTasksChange={setTasks} />
      </div>
    </div>
  );
}
