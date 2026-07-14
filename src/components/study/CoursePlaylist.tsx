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

/**
 * A structured, ordered course the student builds for themselves: a queue of
 * YouTube lectures and PDF readings. Clicking a lecture plays it in the teacher
 * panel; clicking a PDF opens it. Items can be checked off, and the header shows
 * course progress - a light bit of gamification to encourage finishing. Stored
 * in localStorage so it needs no backend and persists across visits.
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
        className="lift flex h-11 items-center gap-1 rounded-full border border-[#c9a15d] bg-[#faf3e2] px-3 text-[#7a2e2e] shadow-md hover:bg-[#f5ecd7]"
      >
        <span className="text-lg">☰</span>
        <span className="hidden text-xs font-medium sm:inline">Course</span>
      </button>

      {open && (
        <div className="animate-rise-in mt-2 w-80 rounded-xl border border-[#c9a15d]/50 bg-[#faf3e2] p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-widest text-[#7a5a30]">Structured course</p>
            <span className="text-xs text-[#7a5a30]">
              {doneCount}/{items.length}
            </span>
          </div>

          {items.length > 0 && (
            <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-[#e8dcc0]">
              <div
                className="h-full rounded-full bg-[#7a2e2e] transition-all duration-500"
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
                      ? "bg-[#7a2e2e] text-[#f5ecd7]"
                      : "border border-[#c9a15d]/40 bg-white/50 text-[#5a4530] hover:bg-white/80"
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
              className="rounded-lg border border-[#c9a15d]/50 bg-white/70 px-2 py-1.5 text-xs text-[#3b2a1a] outline-none focus:ring-2 focus:ring-[#b8935a]"
            />
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={type === "youtube" ? "YouTube link…" : "PDF link…"}
                className="flex-1 rounded-lg border border-[#c9a15d]/50 bg-white/70 px-2 py-1.5 text-xs text-[#3b2a1a] outline-none focus:ring-2 focus:ring-[#b8935a]"
              />
              <button
                type="submit"
                className="rounded-lg bg-[#7a2e2e] px-3 py-1.5 text-xs font-medium text-[#f5ecd7] hover:bg-[#8a3a3a]"
              >
                Add
              </button>
            </div>
            {error && <p className="text-xs text-red-800">{error}</p>}
          </form>

          {items.length === 0 ? (
            <p className="text-center text-xs text-[#7a5a30]">
              Build your course: add lectures and PDF readings in the order you want to study them.
            </p>
          ) : (
            <ul className="flex max-h-72 flex-col gap-1 overflow-y-auto">
              {items.map((item, i) => (
                <li
                  key={item.id}
                  className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 ${
                    item.done ? "border-[#c9a15d]/30 bg-[#c9a15d]/10" : "border-[#c9a15d]/30 bg-white/40"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => toggleDone(item.id)}
                    className="h-3.5 w-3.5 shrink-0"
                    aria-label="Mark done"
                  />
                  <button
                    type="button"
                    onClick={() => openItem(item)}
                    className={`flex-1 truncate text-left text-xs ${
                      item.done ? "text-[#7a5a30] line-through" : "text-[#3b2a1a]"
                    }`}
                    title={item.url}
                  >
                    {item.type === "youtube" ? "▶ " : "📄 "}
                    {item.title}
                  </button>
                  <div className="flex shrink-0 items-center gap-0.5 text-[#7a5a30]">
                    <button type="button" onClick={() => move(i, -1)} aria-label="Move up" className="hover:text-[#3b2a1a]">
                      ↑
                    </button>
                    <button type="button" onClick={() => move(i, 1)} aria-label="Move down" className="hover:text-[#3b2a1a]">
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      aria-label="Remove"
                      className="text-red-800/70 hover:text-red-800"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
