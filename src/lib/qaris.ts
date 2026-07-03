import type { Qari } from "./types";

export const qaris: Qari[] = [
  { id: "alafasy", name: "Mishary Alafasy", style: "Murattal", everyAyahFolder: "Alafasy_128kbps" },
  { id: "dossari", name: "Yasser Al-Dossari", style: "Murattal", everyAyahFolder: "Yasser_Ad-Dussary_128kbps" },
  { id: "muaiqly", name: "Maher Al-Muaiqly", style: "Murattal", everyAyahFolder: "MaherAlMuaiqly128kbps" },
  { id: "luhaidan", name: "Muhammad Al-Luhaidan", style: "Murattal", everyAyahFolder: null },
  { id: "ghamdi", name: "Saad Al-Ghamdi", style: "Murattal", everyAyahFolder: "Ghamadi_40kbps" },
  { id: "minshawi", name: "Al-Minshawi", style: "Mujawwad", everyAyahFolder: "Minshawy_Mujawwad_128kbps" },
  { id: "abdulbasit", name: "Abdul Basit", style: "Mujawwad", everyAyahFolder: "Abdul_Basit_Mujawwad_128kbps" },
  { id: "hussary", name: "Al-Hussary", style: "Mujawwad", everyAyahFolder: "Husary_Mujawwad_128kbps" },
];

export function getQari(id: string): Qari | undefined {
  return qaris.find((q) => q.id === id);
}
