import type { Scene } from "./types";

export const scenes: Scene[] = [
  { id: "sunset", name: "Sunset Horizon" },
  { id: "ocean", name: "Ocean Waves" },
  { id: "desert", name: "Desert Dusk" },
  { id: "mountains", name: "Misty Mountains" },
  { id: "nightsky", name: "Starry Night" },
  { id: "forest", name: "Quiet Forest" },
  { id: "parchment", name: "Parchment" },
  { id: "ivory", name: "Ivory" },
  { id: "sepia", name: "Sepia Photograph" },
  { id: "charcoal", name: "Charcoal" },
  { id: "rosedusk", name: "Rose Dusk" },
  { id: "lavender", name: "Lavender Haze" },
  { id: "goldenhour", name: "Golden Hour" },
  { id: "tealfade", name: "Teal Fade" },
  { id: "moonlit", name: "Moonlit Silver" },
  { id: "mistydawn", name: "Misty Dawn" },
];

export function getScene(id: string): Scene {
  return scenes.find((s) => s.id === id) ?? scenes[0];
}

export function randomSceneId(): string {
  return scenes[Math.floor(Math.random() * scenes.length)].id;
}
