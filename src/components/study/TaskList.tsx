"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { StudyTask } from "@/lib/types";
import { useLanguage } from "@/lib/i18n";

/**
 * The class to-do list, shared live across everyone in the class. Local edits go
 * straight to Supabase; a Realtime subscription keeps every participant's list in
 * sync (adds, completes, deletes) - including people who join later, who load the
 * current list from the server.
 */
export default function TaskList({
  initialTasks,
  classId,
  fill = false,
}: {
  initialTasks: StudyTask[];
  classId: string;
  fill?: boolean;
}) {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<StudyTask[]>(initialTasks);
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Live sync: reflect inserts/updates/deletes from anyone in the class.
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`tasks:${classId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "study_tasks", filter: `class_id=eq.${classId}` },
        (payload) => {
          const t = payload.new as StudyTask;
          setTasks((prev) => (prev.some((x) => x.id === t.id) ? prev : [...prev, t]));
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "study_tasks", filter: `class_id=eq.${classId}` },
        (payload) => {
          const t = payload.new as StudyTask;
          setTasks((prev) => prev.map((x) => (x.id === t.id ? { ...x, ...t } : x)));
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "study_tasks", filter: `class_id=eq.${classId}` },
        (payload) => {
          const old = payload.old as { id: string };
          setTasks((prev) => prev.filter((x) => x.id !== old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [classId]);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    setSubmitting(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSubmitting(false);
      return;
    }

    const { data, error } = await supabase
      .from("study_tasks")
      .insert({ title: trimmed, user_id: user.id, class_id: classId })
      .select("id, title, is_done, created_at, completed_at")
      .single();

    setSubmitting(false);
    if (!error && data) {
      setTitle("");
      setTasks((prev) => (prev.some((x) => x.id === (data as StudyTask).id) ? prev : [...prev, data as StudyTask]));
    }
  }

  async function toggleTask(task: StudyTask) {
    const nextDone = !task.is_done;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, is_done: nextDone, completed_at: nextDone ? new Date().toISOString() : null } : t
      )
    );
    const supabase = createClient();
    await supabase
      .from("study_tasks")
      .update({ is_done: nextDone, completed_at: nextDone ? new Date().toISOString() : null })
      .eq("id", task.id);
  }

  async function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    const supabase = createClient();
    await supabase.from("study_tasks").delete().eq("id", id);
  }

  const doneCount = tasks.filter((t) => t.is_done).length;

  return (
    <div className={`glass flex min-w-0 flex-col rounded-2xl p-2.5 sm:p-4 ${fill ? "h-full min-h-0" : ""}`}>
      <div className="mb-2 flex shrink-0 items-start justify-between gap-2">
        <p className="min-w-0 text-[11px] font-medium uppercase tracking-wide text-emerald-200/70 sm:text-xs sm:tracking-widest">
          {t("todoList")}
        </p>
        <span className="shrink-0 text-[11px] text-white/50 sm:text-xs">
          {doneCount}/{tasks.length}
        </span>
      </div>

      <form onSubmit={addTask} className="mb-2 flex shrink-0 gap-1.5">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("addTaskPlaceholder")}
          className="min-w-0 flex-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-sm text-white outline-none placeholder:text-white/40 focus:ring-2 focus:ring-emerald-500/50"
        />
        <button
          type="submit"
          disabled={submitting}
          className="shrink-0 rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-medium text-emerald-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          {t("add")}
        </button>
      </form>

      {tasks.length === 0 ? (
        <p className="text-center text-sm text-white/45">{t("noTasksYet")}</p>
      ) : (
        <ul className={`flex flex-col gap-1.5 ${fill ? "min-h-0 flex-1 overflow-y-auto pr-1" : ""}`}>
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex min-w-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5"
            >
              <input
                type="checkbox"
                checked={task.is_done}
                onChange={() => toggleTask(task)}
                className="h-4 w-4 shrink-0 accent-emerald-500"
              />
              <span
                className={`min-w-0 flex-1 truncate text-sm ${task.is_done ? "text-white/40 line-through" : "text-white/90"}`}
                title={task.title}
              >
                {task.title}
              </span>
              <button
                type="button"
                onClick={() => deleteTask(task.id)}
                aria-label={t("deleteTask")}
                className="shrink-0 text-red-300/70 hover:text-red-300"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
