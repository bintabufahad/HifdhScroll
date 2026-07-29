/** Extracts a playlist id (the `list` param) from a YouTube URL, or null. */
export function extractYouTubePlaylistId(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    if (!parsed.hostname.endsWith("youtube.com") && parsed.hostname !== "youtu.be") return null;
    const list = parsed.searchParams.get("list");
    // Ignore auto-generated "radio"/mix lists, which aren't real playlists.
    if (list && !list.startsWith("RD")) return list;
    return null;
  } catch {
    return null;
  }
}

/** Extracts the video id from the common YouTube URL shapes, or null if it isn't a YouTube link. */
export function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1) || null;
    }
    if (parsed.hostname.endsWith("youtube.com")) {
      if (parsed.pathname === "/watch") return parsed.searchParams.get("v");
      if (parsed.pathname.startsWith("/embed/")) return parsed.pathname.replace("/embed/", "");
      if (parsed.pathname.startsWith("/live/")) return parsed.pathname.replace("/live/", "");
      if (parsed.pathname.startsWith("/shorts/")) return parsed.pathname.replace("/shorts/", "");
    }
    return null;
  } catch {
    return null;
  }
}
