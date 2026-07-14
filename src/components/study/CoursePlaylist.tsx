"use client";

import { useEffect, useState } from "react";
import { extractYouTubeId } from "@/lib/youtube";

type ItemType = "youtube" | "pdf";

interface CourseItem {
  id: string;
  type: ItemType;
  url: string;
  title: string;
  done: boolean;
}

const STORAGE_KEY = "hifdhscroll.study.course";

function loadCourse(): CourseItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CourseItem[]) : [];
  } catch {
    return [];
  }
}

function thumb(id: string): string {
  return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
}

/**
 * A structured, ordered course the student builds for themselves: a queue of
 * YouTube lectures and PDF readings. YouTube links show their cover thumbnail
 * so it's clear which video is which. Clicking a lecture plays it in the teacher
 * panel; clicking a PDF opens it. Items can be checked off, and the header shows
 * course progress. Stored in localStorage so it needs no backend.
 */
export default function CoursePlaylist({ onPlayLecture }: { onPlayLecture: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CourseItem[]>(loadCourse);
  const [type, setType] = useState<ItemType>("youtube");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore storage write failures
    }
  }, [items]);

  const previewId = type === "youtube" ? extractYouTubeId(url) : null;

  function addItem(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;

    if (type === "youtube" && !extractYouTubeId(trimmed)) {
      setError("That doesn't look like a YouTube link.");
      return;
    }
    if (type === "pdf") {
      try {
        new URL(trimmed);
      } catch {
        setError("Please paste a full PDF link (starting with https://).");
        return;
      }
    }

    setError("");
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type,
        url: trimmed,
        title: title.trim() || (type === "youtube" ? "Lecture" : "Reading (PDF)"),
        done: false,
      },
    ]);
    setUrl("");
    setTitle("");
  }

  function openItem(item: CourseItem) {
    if (item.type === "youtube") {
      const id = extractYouTubeId(item.url);
      if (id) {
        onPlayLecture(id);
        setOpen(false);
      }
    } else {
      window.open(item.url, "_blank", "noopener,noreferrer");
    }
  }

  function toggleDone(id: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function move(index: number, dir: -1 | 1) {
    setItems((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  const doneCount = items.filter((i) => i.done).length;
  const progress = items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0;

  return (
    <div className="fixed right-[4.75rem] top-4 z-50">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Course playlist"
        className="lift glass-strong flex h-11 items-center gap-1 rounded-full px-3 text-emerald-200 shadow-md hover:text-white"
      >
        <span className="text-lg">☰</span>
        <span className="hidden text-xs font-medium sm:inline">Course</span>
      </button>

      {open && (
        <div className="glass-strong animate-rise-in mt-2 w-80 rounded-xl p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-widest text-emerald-200/70">Structured course</p>
            <span className="text-xs text-white/50">
              {doneCount}/{items.length}
            </span>
          </div>

          {items.length > 0 && (
            <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <form onSubmit={addItem} className="mb-3 flex flex-col gap-2">
            <div className="flex gap-1">
              {(["youtube", "pdf"] as ItemType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 rounded-lg px-2 py-1 text-xs font-medium transition ${
                    type === t
                      ? "bg-emerald-500 text-emerald-950"
                      : "border border-white/15 bg-white/5 text-white/70 hover:bg-white/10"
                  }`}
                >
                  {t === "youtube" ? "▶ Lecture" : "📄 PDF"}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (optional)"
              className="rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-xs text-white outline-none placeholder:text-white/40 focus:ring-2 focus:ring-emerald-500/50"
            />
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={type === "youtube" ? "YouTube link…" : "PDF link…"}
                className="flex-1 rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-xs text-white outline-none placeholder:text-white/40 focus:ring-2 focus:ring-emerald-500/50"
              />
              <button
                type="submit"
                className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-emerald-950 hover:bg-emerald-400"
              >
                Add
              </button>
            </div>
            {/* Cover preview so you can see which video you're adding. */}
            {previewId && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumb(previewId)}
                alt="Video preview"
                className="h-24 w-full rounded-lg border border-white/10 object-cover"
              />
            )}
            {error && <p className="text-xs text-red-300">{error}</p>}
          </form>

          {items.length === 0 ? (
            <p className="text-center text-xs text-white/45">
              Build your course: add lectures and PDF readings in the order you want to study them.
            </p>
          ) : (
            <ul className="flex max-h-80 flex-col gap-1.5 overflow-y-auto">
              {items.map((item, i) => {
                const ytId = item.type === "youtube" ? extractYouTubeId(item.url) : null;
                return (
                  <li
                    key={item.id}
                    className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 ${
                      item.done ? "border-emerald-400/30 bg-emerald-500/10" : "border-white/10 bg-white/5"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => toggleDone(item.id)}
                      className="h-3.5 w-3.5 shrink-0 accent-emerald-500"
                      aria-label="Mark done"
                    />
                    <button
                      type="button"
                      onClick={() => openItem(item)}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                      title={item.url}
                    >
                      {ytId ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={thumb(ytId)} alt="" className="h-8 w-12 shrink-0 rounded object-cover" />
                      ) : (
                        <span className="flex h-8 w-12 shrink-0 items-center justify-center rounded bg-white/10 text-sm">
                          📄
                        </span>
                      )}
                      <span className={`truncate text-xs ${item.done ? "text-white/40 line-through" : "text-white/85"}`}>
                        {item.title}
                      </span>
                    </button>
                    <div className="flex shrink-0 items-center gap-0.5 text-white/50">
                      <button type="button" onClick={() => move(i, -1)} aria-label="Move up" className="hover:text-white">
                        ↑
                      </button>
                      <button type="button" onClick={() => move(i, 1)} aria-label="Move down" className="hover:text-white">
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(item.id)}
                        aria-label="Remove"
                        className="text-red-300/70 hover:text-red-300"
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
