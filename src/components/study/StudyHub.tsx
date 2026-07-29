"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { StudyClass } from "@/lib/types";
import { useLanguage } from "@/lib/i18n";

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
  const { t, lang, dir } = useLanguage();
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
      setError(t("signInAgain"));
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
      setError(t("couldntCreateClass"));
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
        placeholder={t("classNamePlaceholder")}
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
          {creating ? t("openingClass") : t("createClass")}
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
          {t("cancel")}
        </button>
      </div>
      {error && <p className="text-center text-sm text-red-300">{error}</p>}
    </form>
  );

  return (
    <div dir={dir} className="bg-app-dark flex min-h-[100dvh] flex-col px-4 py-6 sm:px-6 sm:py-10">
      <header className="mx-auto mb-8 flex w-full max-w-4xl items-center gap-3">
        <Link
          href="/"
          className="lift inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500 px-4 py-1.5 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
        >
          {dir === "rtl" ? "→" : "←"} {t("home")}
        </Link>
        <h1 className="font-display text-xl font-bold text-white sm:text-3xl">
          {lang === "ar" ? t("studyTitle") : (<>Student of <span className="text-emerald-300">Knowledge</span></>)}
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
                aria-label={t("createFirstClass")}
                className="lift flex h-32 w-32 items-center justify-center rounded-3xl border-2 border-dashed border-emerald-400/40 bg-emerald-500/5 text-6xl font-light text-emerald-300 transition hover:border-emerald-400 hover:bg-emerald-500/10"
              >
                +
              </button>
              <div>
                <p className="font-display text-lg font-semibold text-white">{t("createFirstClass")}</p>
                <p className="mt-1 text-sm text-white/55">{t("focusRoomLine")}</p>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="mx-auto w-full max-w-2xl">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {classes.map((c) => (
              <div key={c.id} className="group relative">
                <Link
                  href={`/study/class/${c.room}`}
                  className="flex aspect-[3/2] flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.015] p-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-400/40 hover:from-emerald-500/[0.12] hover:to-white/[0.02] hover:shadow-[0_10px_26px_-14px_rgba(16,185,129,0.55)]"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-sm ring-1 ring-emerald-400/20 transition duration-300 group-hover:bg-emerald-500/25 group-hover:ring-emerald-400/40">
                    📚
                  </span>
                  <div className="min-w-0">
                    <span className="block truncate font-display text-sm font-semibold text-white" title={c.name}>
                      {c.name}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1 text-xs font-medium text-emerald-300/90">
                      Enter
                      <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                    </span>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => deleteClass(c.id)}
                  aria-label={t("deleteClass")}
                  className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/40 text-xs text-white/40 opacity-0 backdrop-blur transition hover:bg-red-500/20 hover:text-red-300 group-hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            ))}

            {/* Create-another tile */}
            {showForm ? (
              <div className="glass col-span-2 rounded-xl px-2 py-3 sm:col-span-3">{createForm}</div>
            ) : (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                aria-label={t("newClass")}
                className="group flex aspect-[3/2] flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-white/12 text-emerald-300/90 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-400/50 hover:bg-emerald-500/[0.06] hover:text-emerald-200"
              >
                <span className="text-2xl font-light">+</span>
                <span className="text-xs font-medium">{t("newClass")}</span>
              </button>
            )}
          </div>
          {showForm && error && <p className="mt-3 text-center text-sm text-red-300">{error}</p>}
        </div>
      )}
    </div>
  );
}
