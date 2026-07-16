import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rusookh",
    short_name: "Rusookh",
    description: "Memorize the Qur'an through short reels, and study with focus as a student of knowledge.",
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
