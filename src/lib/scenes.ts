import type { Scene } from "./types";

export const scenes: Scene[] = [
  { id: "sunset", name: "Sunset Horizon" },
  { id: "ocean", name: "Ocean Waves" },
  { id: "desert", name: "Desert Dusk" },
  { id: "mountains", name: "Misty Mountains" },
  { id: "nightsky", name: "Starry Night" },
  { id: "forest", name: "Quiet Forest" },
];

export function getScene(id: string): Scene {
  return scenes.find((s) => s.id === id) ?? scenes[0];
}
