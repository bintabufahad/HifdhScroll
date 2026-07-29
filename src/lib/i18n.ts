"use client";

import { useEffect, useState } from "react";

export type Lang = "en" | "ar";

const STORAGE_KEY = "rusookh-lang";

/** UI strings for the home hub + settings. Arabic coverage grows from here. */
const STRINGS = {
  tagline: {
    en: "Your companion for the Qur'an — memorize through short reels, and study with focus.",
    ar: "رفيقك مع القرآن — احفظ عبر مقاطع قصيرة، وادرس بتركيز.",
  },
  reelsTitle: { en: "Quran Reels", ar: "مقاطع القرآن" },
  reelsDesc: {
    en: "Short, looping ayah reels with recitation and scenery — for memorization.",
    ar: "مقاطع قصيرة متكررة للآيات مع التلاوة والمناظر — للحفظ.",
  },
  reelsOpen: { en: "Open Reels →", ar: "افتح المقاطع ←" },
  studyTitle: { en: "Student of Knowledge", ar: "طالب العلم" },
  studyDesc: {
    en: "A focused study space: simulated class, lecture & course player, timer, to-do list.",
    ar: "مساحة دراسة مركزة: فصل دراسي، محاضرات ودورات، مؤقت، وقائمة مهام.",
  },
  studyOpen: { en: "Open Dashboard →", ar: "افتح اللوحة ←" },
  newHere: { en: "New here?", ar: "جديد هنا؟" },
  signInFree: { en: "Sign in free", ar: "سجّل مجانًا" },
  reviews: { en: "Reviews", ar: "التقييمات" },
  settings: { en: "Settings", ar: "الإعدادات" },
  signedInAs: { en: "Signed in as", ar: "مسجّل الدخول باسم" },
  notSignedIn: { en: "Not signed in", ar: "لم يتم تسجيل الدخول" },
  logout: { en: "Log out", ar: "تسجيل الخروج" },
  language: { en: "Language", ar: "اللغة" },
  sendAyah: { en: "Send an ayah", ar: "أهدِ آية" },
} as const;

export type StringKey = keyof typeof STRINGS;

export function getStoredLang(): Lang {
  if (typeof window === "undefined") return "en";
  return window.localStorage.getItem(STORAGE_KEY) === "ar" ? "ar" : "en";
}

/** Client language hook: persisted in localStorage, defaults to English. */
export function useLanguage() {
  const [lang, setLang] = useState<Lang>("en");

  // Read after mount so server and first client render agree (avoids hydration
  // mismatch); deferred so it isn't a synchronous setState in the effect body.
  useEffect(() => {
    const id = setTimeout(() => setLang(getStoredLang()), 0);
    return () => clearTimeout(id);
  }, []);

  function switchLang(next: Lang) {
    window.localStorage.setItem(STORAGE_KEY, next);
    setLang(next);
  }

  const t = (key: StringKey): string => STRINGS[key][lang];

  return { lang, switchLang, t, dir: (lang === "ar" ? "rtl" : "ltr") as "rtl" | "ltr" };
}
