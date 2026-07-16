import type { Qari } from "./types";

// EveryAyah.com folder slugs vary in bitrate suffix and aren't all independently
// confirmed; each reciter lists candidates in priority order, and the player also
// tries quran.com's documented audio API before giving up on audio for that
// reciter, so a wrong guess degrades instead of silently breaking the reciter.
// Minshawi falls back to his Murattal recording if the Mujawwad folder isn't
// found, so at least audio plays even if not that style.
export const qaris: Qari[] = [
  { id: "alafasy", name: "Mishary Alafasy", style: "Murattal", everyAyahFolders: ["Alafasy_128kbps", "Alafasy_64kbps"] },
  {
    id: "dossari",
    name: "Yasser Al-Dossari",
    style: "Murattal",
    everyAyahFolders: ["Yasser_Ad-Dussary_128kbps", "Yasser_Ad-Dussary_64kbps"],
  },
  {
    id: "muaiqly",
    name: "Maher Al-Muaiqly",
    style: "Murattal",
    everyAyahFolders: ["MaherAlMuaiqly128kbps", "Maher_AlMuaiqly_64kbps", "MaherAlMuaiqly64kbps"],
  },
  { id: "ghamdi", name: "Saad Al-Ghamdi", style: "Murattal", everyAyahFolders: ["Ghamadi_40kbps", "Ghamdi_40kbps"] },
  {
    id: "sudais",
    name: "Abdul Rahman Al-Sudais",
    style: "Murattal",
    everyAyahFolders: ["Abdurrahmaan_As-Sudais_192kbps", "Sudais_128kbps"],
  },
  {
    id: "shuraim",
    name: "Saud Al-Shuraim",
    style: "Murattal",
    everyAyahFolders: ["Saood_ash-Shuraym_128kbps", "Shuraim_128kbps"],
  },
  {
    id: "shatri",
    name: "Abu Bakr Al-Shatri",
    style: "Murattal",
    everyAyahFolders: ["Abu_Bakr_Ash-Shaatree_128kbps", "AbuBakrAlShatri128kbps"],
  },
  {
    id: "hudhaify",
    name: "Ali Al-Hudhaify",
    style: "Murattal",
    everyAyahFolders: ["Hudhaify_128kbps", "Hudhaify_32kbps"],
  },
  {
    id: "ayyoub",
    name: "Muhammad Ayyoub",
    style: "Murattal",
    everyAyahFolders: ["Muhammad_Ayyoub_128kbps", "Muhammad_Ayyoub_64kbps"],
  },
  {
    id: "minshawi",
    name: "Al-Minshawi",
    style: "Murattal",
    everyAyahFolders: ["Minshawy_Mujawwad_128kbps", "Minshawy_Mujawwad_192kbps", "Minshawy_Murattal_128kbps"],
  },
  {
    id: "abdulbasit",
    name: "Abdul Basit",
    style: "Murattal",
    everyAyahFolders: ["Abdul_Basit_Mujawwad_128kbps", "Abdul_Basit_Mujawwad_64kbps"],
  },
  {
    id: "hussary",
    name: "Al-Hussary",
    style: "Murattal",
    everyAyahFolders: ["Husary_Mujawwad_128kbps", "Husary_Mujawwad_192kbps", "Husary_128kbps"],
  },
];

export function getQari(id: string): Qari | undefined {
  return qaris.find((q) => q.id === id);
}
