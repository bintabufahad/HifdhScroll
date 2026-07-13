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
    <div className="rounded-2xl border border-[#c9a15d]/40 bg-[#faf3e2] p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-widest text-[#7a5a30]">Study to-do list</p>
        <span className="text-xs text-[#7a5a30]">
          {doneCount}/{tasks.length} done
        </span>
      </div>

      <form onSubmit={addTask} className="mb-3 flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Memorize Ayat al-Kursi"
          className="flex-1 rounded-lg border border-[#c9a15d]/50 bg-white/60 px-3 py-2 text-sm text-[#3b2a1a] outline-none focus:ring-2 focus:ring-[#b8935a]"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-[#7a2e2e] px-4 py-2 text-sm font-medium text-[#f5ecd7] hover:bg-[#8a3a3a] disabled:opacity-60"
        >
          Add
        </button>
      </form>

      {tasks.length === 0 ? (
        <p className="text-center text-sm text-[#7a5a30]">No tasks yet — add your first one above.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center gap-2 rounded-lg border border-[#c9a15d]/30 bg-white/40 px-3 py-2"
            >
              <input
                type="checkbox"
                checked={task.is_done}
                onChange={() => toggleTask(task)}
                className="h-4 w-4"
              />
              <span className={`flex-1 text-sm ${task.is_done ? "text-[#7a5a30] line-through" : "text-[#3b2a1a]"}`}>
                {task.title}
              </span>
              <button
                type="button"
                onClick={() => deleteTask(task.id)}
                aria-label="Delete task"
                className="text-xs text-red-800/70 hover:text-red-800"
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
