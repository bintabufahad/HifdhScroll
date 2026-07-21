"use client";

import { useState } from "react";
import Link from "next/link";
import MainStage from "./MainStage";
import StudyTimer from "./StudyTimer";
import TaskList from "./TaskList";
import CoursePlaylist from "./CoursePlaylist";
import JitsiRoom from "./JitsiRoom";
import type { CourseItem, StudyClass, StudyTask } from "@/lib/types";

export default function ClassRoom({
  studyClass,
  initialTasks,
  initialCourse,
  canSave,
  displayName,
}: {
  studyClass: StudyClass;
  initialTasks: StudyTask[];
  initialCourse: CourseItem[];
  /** True when a signed-in user opened the room; guests can join the call but can't save tasks/course. */
  canSave: boolean;
  displayName?: string;
}) {
  const [tasks, setTasks] = useState(initialTasks);
  const [toast, setToast] = useState("");
  const [lectureId, setLectureId] = useState<string | null>(null);
  const [courseOpen, setCourseOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleSessionComplete(seconds: number) {
    const minutes = Math.max(1, Math.round(seconds / 60));
    setToast(`Focus session complete — ${minutes} min. Baarak Allahu feek!`);
    setTimeout(() => setToast(""), 5000);
  }

  async function copyInvite() {
    const inviteUrl = `${window.location.origin}/study/class/${studyClass.room}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setToast("Couldn't copy — long-press the link to copy it.");
      setTimeout(() => setToast(""), 4000);
    }
  }

  return (
    <div className="bg-app-dark relative flex h-[100dvh] flex-col overflow-hidden px-2 py-2 sm:px-4 sm:py-3">
      {canSave && (
        <CoursePlaylist
          open={courseOpen}
          onToggle={() => setCourseOpen((v) => !v)}
          onPlayLecture={(id) => {
            setLectureId(id);
            setCourseOpen(false);
          }}
          initialItems={initialCourse}
        />
      )}

      {toast && (
        <div className="animate-rise-in fixed left-1/2 top-3 z-50 -translate-x-1/2">
          <span className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-4 py-1.5 text-xs text-emerald-100 backdrop-blur sm:text-sm">
            {toast}
          </span>
        </div>
      )}

      <header className="mx-auto mb-2 flex w-full max-w-[1600px] shrink-0 items-center gap-2 pr-14 sm:pr-24">
        <Link
          href={canSave ? "/study" : "/"}
          className="lift inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-emerald-950 transition hover:bg-emerald-400 sm:px-4 sm:py-1.5 sm:text-sm"
        >
          ←{canSave ? " Classes" : " Home"}
        </Link>
        <h1 className="min-w-0 flex-1 truncate font-display text-sm font-bold text-white sm:text-2xl">
          <span className="text-emerald-300">{studyClass.name}</span>
        </h1>
        <button
          type="button"
          onClick={copyInvite}
          className="lift inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-500/20 sm:px-4 sm:py-1.5 sm:text-sm"
        >
          {copied ? "✓ Copied" : "Invite link"}
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

        {/* Group video call (replaces the solo camera) */}
        <div className="area-camera glass flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl p-1.5 sm:p-2">
          <JitsiRoom room={studyClass.room} displayName={displayName} />
        </div>

        {/* Planner / to-do */}
        <div className="area-planner flex min-h-0 min-w-0 flex-col">
          {canSave ? (
            <TaskList tasks={tasks} onTasksChange={setTasks} fill />
          ) : (
            <div className="glass flex h-full min-h-0 flex-col items-center justify-center gap-2 rounded-2xl p-4 text-center">
              <p className="text-sm text-white/70">You&apos;re joining as a guest.</p>
              <Link href="/waitlist" className="text-sm font-semibold text-emerald-300 underline underline-offset-2">
                Sign in
              </Link>
              <p className="text-xs text-white/45">to use your own timer planner and save progress.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
