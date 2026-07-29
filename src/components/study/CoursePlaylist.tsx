"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { extractYouTubeId, extractYouTubePlaylistId } from "@/lib/youtube";
import type { CourseItem, CourseItemType } from "@/lib/types";
import { useLanguage } from "@/lib/i18n";

function thumb(id: string): string {
  return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
}

/**
 * A structured, ordered course the student builds for themselves: a queue of
 * YouTube lectures and PDF readings, stored per-user in Supabase (see migration
 * 005) so it's durable and cross-device - not just browser cache. YouTube links
 * show their cover thumbnail. Clicking a lecture plays it in the teacher panel;
 * a PDF opens in a new tab.
 */
export default function CoursePlaylist({
  open,
  onToggle,
  onPlayLecture,
  initialItems,
  classId,
  onOpenWhiteboard,
}: {
  open: boolean;
  onToggle: () => void;
  onPlayLecture: (lecture: { videoId: string | null; list: string | null }) => void;
  initialItems: CourseItem[];
  /** The class this course belongs to, so a new item is scoped to this room. */
  classId: string;
  /** When provided, a Whiteboard button is shown grouped next to the Course button. */
  onOpenWhiteboard?: () => void;
}) {
  const { t } = useLanguage();
  const [items, setItems] = useState<CourseItem[]>(initialItems);
  const [type, setType] = useState<CourseItemType>("youtube");
  const [url, setUrl] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const previewId = type === "youtube" ? extractYouTubeId(url) : null;

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const position = items.length > 0 ? Math.max(...items.map((i) => i.position)) + 1 : 0;

    if (type === "youtube") {
      const trimmed = url.trim();
      if (!trimmed) return;
      const isList = !!extractYouTubePlaylistId(trimmed);
      if (!extractYouTubeId(trimmed) && !isList) {
        setError(t("notYtShort"));
        return;
      }
      setBusy(true);
      const { data, error: insErr } = await supabase
        .from("course_items")
        .insert({
          user_id: user.id,
          class_id: classId,
          type: "youtube",
          url: trimmed,
          title: title.trim() || (isList ? t("playlistDefault") : t("lectureDefault")),
          position,
        })
        .select("id, type, url, title, done, position")
        .single();
      setBusy(false);
      if (!insErr && data) {
        setItems((prev) => [...prev, data as CourseItem]);
        setUrl("");
        setTitle("");
      } else {
        setError(t("saveFailed"));
      }
      return;
    }

    // PDF: upload the chosen file from the device to storage.
    if (!pdfFile) {
      setError(t("choosePdfFirst"));
      return;
    }
    setBusy(true);
    const safeName = pdfFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${classId}/${crypto.randomUUID()}-${safeName}`;
    const { error: upErr } = await supabase.storage
      .from("course-pdfs")
      .upload(path, pdfFile, { contentType: "application/pdf", upsert: false });
    if (upErr) {
      setBusy(false);
      setError(t("uploadFailed"));
      return;
    }
    const { data: pub } = supabase.storage.from("course-pdfs").getPublicUrl(path);
    const { data, error: insErr } = await supabase
      .from("course_items")
      .insert({
        user_id: user.id,
        class_id: classId,
        type: "pdf",
        url: pub.publicUrl,
        title: title.trim() || pdfFile.name,
        position,
      })
      .select("id, type, url, title, done, position")
      .single();
    setBusy(false);
    if (!insErr && data) {
      setItems((prev) => [...prev, data as CourseItem]);
      setPdfFile(null);
      setTitle("");
    } else {
      setError(t("saveFailed"));
    }
  }

  function openItem(item: CourseItem) {
    if (item.type === "youtube") {
      const list = extractYouTubePlaylistId(item.url);
      const id = extractYouTubeId(item.url);
      if (list || id) onPlayLecture({ videoId: list ? null : id, list });
    } else {
      window.open(item.url, "_blank", "noopener,noreferrer");
    }
  }

  async function toggleDone(item: CourseItem) {
    const next = !item.done;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, done: next } : i)));
    const supabase = createClient();
    await supabase.from("course_items").update({ done: next }).eq("id", item.id);
  }

  async function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    const supabase = createClient();
    await supabase.from("course_items").delete().eq("id", id);
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const a = items[index];
    const b = items[target];
    // Swap positions locally and persist both.
    const reordered = [...items];
    reordered[index] = { ...b, position: a.position };
    reordered[target] = { ...a, position: b.position };
    reordered.sort((x, y) => x.position - y.position);
    setItems(reordered);
    const supabase = createClient();
    await Promise.all([
      supabase.from("course_items").update({ position: b.position }).eq("id", a.id),
      supabase.from("course_items").update({ position: a.position }).eq("id", b.id),
    ]);
  }

  const doneCount = items.filter((i) => i.done).length;
  const progress = items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0;

  return (
    <div className="fixed right-4 top-4 z-50 flex items-center gap-2">
      {onOpenWhiteboard && (
        <button
          type="button"
          onClick={onOpenWhiteboard}
          aria-label={t("whiteboardBtn")}
          className="lift glass-strong flex h-11 items-center gap-1 rounded-full border border-transparent px-3 text-emerald-200 shadow-md transition hover:text-white"
        >
          <span className="text-lg">🖊️</span>
          <span className="hidden text-xs font-medium sm:inline">{t("whiteboardBtn")}</span>
        </button>
      )}
      <button
        type="button"
        onClick={onToggle}
        aria-label={t("courseBtn")}
        className={`lift flex h-11 items-center gap-1 rounded-full border px-3 shadow-md transition ${
          open
            ? "border-emerald-400 bg-emerald-500 text-emerald-950"
            : "glass-strong border-transparent text-emerald-200 hover:text-white"
        }`}
      >
        <span className="text-lg">☰</span>
        <span className="hidden text-xs font-medium sm:inline">{t("courseBtn")}</span>
      </button>

      {open && (
        <div className="animate-rise-in fixed right-3 top-[4.25rem] w-80 rounded-xl border border-white/12 bg-[#0c1512] p-3 shadow-2xl">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-widest text-emerald-200/70">{t("structuredCourse")}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50">
                {doneCount}/{items.length}
              </span>
              <button
                type="button"
                onClick={onToggle}
                aria-label={t("close")}
                className="flex h-6 w-6 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>
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
              {(["youtube", "pdf"] as CourseItemType[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setType(tab)}
                  className={`flex-1 rounded-lg px-2 py-1 text-xs font-medium transition ${
                    type === tab
                      ? "bg-emerald-500 text-emerald-950"
                      : "border border-white/15 bg-white/5 text-white/70 hover:bg-white/10"
                  }`}
                >
                  {tab === "youtube" ? t("lectureTab") : t("pdfTab")}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("titleOptional")}
              className="rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-xs text-white outline-none placeholder:text-white/40 focus:ring-2 focus:ring-emerald-500/50"
            />
            <div className="flex gap-2">
              {type === "youtube" ? (
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={t("pasteYtPlaceholder")}
                  className="flex-1 rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-xs text-white outline-none placeholder:text-white/40 focus:ring-2 focus:ring-emerald-500/50"
                />
              ) : (
                <label className="flex flex-1 cursor-pointer items-center truncate rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-xs text-white/70 hover:bg-white/10">
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                  />
                  <span className="truncate">{pdfFile ? pdfFile.name : t("choosePdf")}</span>
                </label>
              )}
              <button
                type="submit"
                disabled={busy}
                className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-emerald-950 hover:bg-emerald-400 disabled:opacity-60"
              >
                {busy ? "…" : t("add")}
              </button>
            </div>
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
              {t("buildCourseHint")}
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
                      onChange={() => toggleDone(item)}
                      className="h-3.5 w-3.5 shrink-0 accent-emerald-500"
                      aria-label="Mark done"
                    />
                    <button
                      type="button"
                      onClick={() => openItem(item)}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                      title={item.url}
                    >
                      {item.type === "youtube" && ytId ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={thumb(ytId)} alt="" className="h-8 w-12 shrink-0 rounded object-cover" />
                      ) : (
                        <span className="flex h-8 w-12 shrink-0 items-center justify-center rounded bg-white/10 text-sm">
                          {item.type === "youtube" ? "🎞️" : "📄"}
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
