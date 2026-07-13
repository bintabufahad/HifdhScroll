"use client";

import { useState } from "react";

function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1) || null;
    }
    if (parsed.hostname.endsWith("youtube.com")) {
      if (parsed.pathname === "/watch") return parsed.searchParams.get("v");
      if (parsed.pathname.startsWith("/embed/")) return parsed.pathname.replace("/embed/", "");
      if (parsed.pathname.startsWith("/live/")) return parsed.pathname.replace("/live/", "");
    }
    return null;
  } catch {
    return null;
  }
}

/** Lets the user paste a lecture link (e.g. a scholar's YouTube talk) and watch it inline, next to the video-call panel and timer, instead of switching tabs. */
export default function LectureEmbed() {
  const [input, setInput] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [error, setError] = useState("");

  function handleLoad(e: React.FormEvent) {
    e.preventDefault();
    const id = extractYouTubeId(input);
    if (!id) {
      setError("That doesn't look like a YouTube link. Paste a full youtube.com or youtu.be URL.");
      return;
    }
    setError("");
    setVideoId(id);
  }

  return (
    <div className="rounded-2xl border border-[#c9a15d]/40 bg-[#faf3e2] p-4">
      <p className="mb-2 text-xs font-medium uppercase tracking-widest text-[#7a5a30]">Lecture</p>
      <form onSubmit={handleLoad} className="mb-3 flex gap-2">
        <input
          type="url"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste a YouTube lecture link…"
          className="flex-1 rounded-lg border border-[#c9a15d]/50 bg-white/60 px-3 py-2 text-sm text-[#3b2a1a] outline-none focus:ring-2 focus:ring-[#b8935a]"
        />
        <button
          type="submit"
          className="rounded-lg bg-[#7a2e2e] px-4 py-2 text-sm font-medium text-[#f5ecd7] hover:bg-[#8a3a3a]"
        >
          Load
        </button>
      </form>
      {error && <p className="mb-2 text-xs text-red-800">{error}</p>}

      {videoId ? (
        <div className="aspect-video overflow-hidden rounded-xl border border-[#c9a15d]/30">
          <iframe
            key={videoId}
            src={`https://www.youtube-nocookie.com/embed/${videoId}`}
            title="Lecture"
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-[#c9a15d]/40 text-sm text-[#7a5a30]">
          No lecture loaded yet
        </div>
      )}
    </div>
  );
}
