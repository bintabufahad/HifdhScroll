"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { StudyTask } from "@/lib/types";

export default function TaskList({
  tasks,
  onTasksChange,
}: {
  tasks: StudyTask[];
  onTasksChange: (tasks: StudyTask[]) => void;
}) {
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
      .insert({ title: trimmed, user_id: user.id })
      .select("id, title, is_done, created_at, completed_at")
      .single();

    setSubmitting(false);
    if (!error && data) {
      setTitle("");
      onTasksChange([...tasks, data as StudyTask]);
    }
  }

  async function toggleTask(task: StudyTask) {
    const supabase = createClient();
    const nextDone = !task.is_done;
    const { error } = await supabase
      .from("study_tasks")
      .update({ is_done: nextDone, completed_at: nextDone ? new Date().toISOString() : null })
      .eq("id", task.id);

    if (!error) {
      onTasksChange(
        tasks.map((t) => (t.id === task.id ? { ...t, is_done: nextDone, completed_at: nextDone ? new Date().toISOString() : null } : t))
      );
    }
  }

  async function deleteTask(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("study_tasks").delete().eq("id", id);
    if (!error) {
      onTasksChange(tasks.filter((t) => t.id !== id));
    }
  }

  const doneCount = tasks.filter((t) => t.is_done).length;

  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-widest text-emerald-200/70">Study to-do list</p>
        <span className="text-xs text-white/50">
          {doneCount}/{tasks.length} done
        </span>
      </div>

      <form onSubmit={addTask} className="mb-3 flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Memorize Ayat al-Kursi"
          className="flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:ring-2 focus:ring-emerald-500/50"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-emerald-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {tasks.length === 0 ? (
        <p className="text-center text-sm text-white/45">No tasks yet — add your first one above.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2"
            >
              <input
                type="checkbox"
                checked={task.is_done}
                onChange={() => toggleTask(task)}
                className="h-4 w-4 accent-emerald-500"
              />
              <span className={`flex-1 text-sm ${task.is_done ? "text-white/40 line-through" : "text-white/90"}`}>
                {task.title}
              </span>
              <button
                type="button"
                onClick={() => deleteTask(task.id)}
                aria-label="Delete task"
                className="text-xs text-red-300/70 hover:text-red-300"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
