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
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

    setCreating(false);
    if (insertError || !data) {
      setError("Couldn't create the class. Please try again.");
      return;
    }
    router.push(`/study/class/${(data as StudyClass).room}`);
  }

  async function deleteClass(id: string) {
    const supabase = createClient();
    const { error: delError } = await supabase.from("classes").delete().eq("id", id);
    if (!delError) setClasses((prev) => prev.filter((c) => c.id !== id));
  }

  async function copyLink(c: StudyClass) {
    const url = `${window.location.origin}/study/class/${c.room}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(c.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setError("Couldn't copy the link.");
    }
  }

  return (
    <div className="bg-app-dark min-h-[100dvh] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-6 flex items-center gap-3">
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

        {/* Study alone */}
        <Link
          href="/study/solo"
          className="lift glass mb-8 flex items-center justify-between gap-4 rounded-2xl p-5 transition hover:bg-white/[0.06] sm:p-6"
        >
          <div>
            <p className="font-display text-lg font-semibold text-white sm:text-xl">Study alone</p>
            <p className="mt-1 text-sm text-white/60">
              Your focus room — timer, a lecture, your planner, and the Ustad keeping you accountable.
            </p>
          </div>
          <span className="text-2xl text-emerald-300">→</span>
        </Link>

        {/* Classes */}
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-lg font-semibold text-white sm:text-xl">Study together</h2>
          <span className="text-xs text-white/45">Share a link · up to 6 join</span>
        </div>

        <form onSubmit={createClass} className="glass mb-5 flex flex-col gap-2 rounded-2xl p-4 sm:flex-row">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name your class (e.g. Fajr Halaqah)"
            className="min-w-0 flex-1 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-white outline-none placeholder:text-white/40 focus:ring-2 focus:ring-emerald-500/50"
          />
          <button
            type="submit"
            disabled={creating}
            className="lift shrink-0 rounded-lg bg-emerald-500 px-5 py-2.5 font-semibold text-emerald-950 hover:bg-emerald-400 disabled:opacity-60"
          >
            {creating ? "Creating…" : "+ Create class"}
          </button>
        </form>

        {error && <p className="mb-4 text-sm text-red-300">{error}</p>}

        {classes.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center text-sm text-white/50">
            No classes yet. Create one above and share its link to study together.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {classes.map((c) => (
              <li
                key={c.id}
                className="glass flex items-center gap-2 rounded-xl p-3 sm:gap-3 sm:p-4"
              >
                <span className="min-w-0 flex-1 truncate font-medium text-white" title={c.name}>
                  {c.name}
                </span>
                <button
                  type="button"
                  onClick={() => copyLink(c)}
                  className="shrink-0 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 sm:text-sm"
                >
                  {copiedId === c.id ? "✓ Copied" : "Copy link"}
                </button>
                <Link
                  href={`/study/class/${c.room}`}
                  className="lift shrink-0 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-emerald-950 hover:bg-emerald-400 sm:text-sm"
                >
                  Enter
                </Link>
                <button
                  type="button"
                  onClick={() => deleteClass(c.id)}
                  aria-label="Delete class"
                  className="shrink-0 text-red-300/70 hover:text-red-300"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
