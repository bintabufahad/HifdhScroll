import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HifdhScroll",
    short_name: "HifdhScroll",
    description: "Scroll through Quran reels — Arabic text, translation, and recitation over a scenic backdrop.",
    start_url: "/",
    display: "standalone",
    background_color: "#022c22",
    theme_color: "#064e3b",
    orientation: "portrait",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
      { src: "/icon-512", sizes: "512x512", type: "image/png" },
    ],
  };
}
