"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { StudyClass } from "@/lib/types";

/** Turns a class name into a unique, URL-safe Jitsi room slug. */
function makeRoomSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `rusookh-${base || "class"}-${suffix}`;
}

export default function StudyHub({ initialClasses }: { initialClasses: StudyClass[] }) {
  const router = useRouter();
  const [classes, setClasses] = useState(initialClasses);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  async function createClass(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setCreating(true);
    setError("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Please sign in again.");
      setCreating(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("classes")
      .insert({ name: trimmed, room: makeRoomSlug(trimmed), owner_id: user.id })
      .select("id, owner_id, name, room, created_at")
      .single();

    if (insertError || !data) {
      setCreating(false);
      setError("Couldn't create the class. Please try again.");
      return;
    }
    // Keep the button disabled and showing "Opening class…" right through the
    // navigation - the component unmounts when the class room loads, so we never
    // reset `creating` on success (that's what made the button look idle for a
    // second or two before anything happened).
    router.push(`/study/class/${(data as StudyClass).room}`);
  }

  async function deleteClass(id: string) {
    const supabase = createClient();
    const { error: delError } = await supabase.from("classes").delete().eq("id", id);
    if (!delError) setClasses((prev) => prev.filter((c) => c.id !== id));
  }

  const createForm = (
    <form onSubmit={createClass} className="flex w-full max-w-sm flex-col gap-2">
      <input
        autoFocus
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name your class (e.g. Fajr Halaqah)"
        className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-center text-white outline-none placeholder:text-white/40 focus:ring-2 focus:ring-emerald-500/50"
      />
      <div className="flex justify-center gap-2">
        <button
          type="submit"
          disabled={creating}
          className="lift inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 font-semibold text-emerald-950 hover:bg-emerald-400 disabled:opacity-70"
        >
          {creating && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-950/30 border-t-emerald-950" />
          )}
          {creating ? "Opening class…" : "Create class"}
        </button>
        <button
          type="button"
          onClick={() => {
            setShowForm(false);
            setName("");
            setError("");
          }}
          className="rounded-lg border border-white/15 px-4 py-2.5 text-white/70 hover:bg-white/5"
        >
          Cancel
        </button>
      </div>
      {error && <p className="text-center text-sm text-red-300">{error}</p>}
    </form>
  );

  return (
    <div className="bg-app-dark flex min-h-[100dvh] flex-col px-4 py-6 sm:px-6 sm:py-10">
      <header className="mx-auto mb-8 flex w-full max-w-4xl items-center gap-3">
        <Link
          href="/"
          className="lift inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500 px-4 py-1.5 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
        >
          ← Home
        </Link>
        <h1 className="font-display text-xl font-bold text-white sm:text-3xl">
          Student of <span className="text-emerald-300">Knowledge</span>
        </h1>
      </header>

      {classes.length === 0 ? (
        // No classes yet: a big + in the middle to create the first one.
        <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
          {showForm ? (
            createForm
          ) : (
            <>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                aria-label="Create your first class"
                className="lift flex h-32 w-32 items-center justify-center rounded-3xl border-2 border-dashed border-emerald-400/40 bg-emerald-500/5 text-6xl font-light text-emerald-300 transition hover:border-emerald-400 hover:bg-emerald-500/10"
              >
                +
              </button>
              <div>
                <p className="font-display text-lg font-semibold text-white">Create your first class</p>
                <p className="mt-1 text-sm text-white/55">Your focus room — timer, lecture, planner, and a call you can share.</p>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="mx-auto w-full max-w-4xl">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {classes.map((c) => (
              <div
                key={c.id}
                className="glass lift group relative flex aspect-square flex-col justify-between rounded-2xl p-4 transition hover:bg-white/[0.06]"
              >
                <button
                  type="button"
                  onClick={() => deleteClass(c.id)}
                  aria-label="Delete class"
                  className="absolute right-2 top-2 text-white/30 opacity-0 transition hover:text-red-300 group-hover:opacity-100"
                >
                  ✕
                </button>
                <Link href={`/study/class/${c.room}`} className="flex flex-1 flex-col justify-between">
                  <span className="text-2xl">📚</span>
                  <span className="mt-2 line-clamp-2 font-display font-semibold text-white" title={c.name}>
                    {c.name}
                  </span>
                  <span className="mt-1 text-xs text-emerald-300">Enter →</span>
                </Link>
              </div>
            ))}

            {/* Create-another tile */}
            <div className="flex aspect-square items-center justify-center rounded-2xl border-2 border-dashed border-white/12">
              {showForm ? (
                <div className="w-full px-2">{createForm}</div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  aria-label="Create a new class"
                  className="lift flex h-full w-full flex-col items-center justify-center gap-1 text-emerald-300 transition hover:bg-emerald-500/5"
                >
                  <span className="text-4xl font-light">+</span>
                  <span className="text-xs font-medium">New class</span>
                </button>
              )}
            </div>
          </div>
          {showForm && error && <p className="mt-3 text-center text-sm text-red-300">{error}</p>}
        </div>
      )}
    </div>
  );
}
