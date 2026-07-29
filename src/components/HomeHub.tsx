"use client";

import Link from "next/link";
import SettingsMenu from "@/components/SettingsMenu";
import { useLanguage } from "@/lib/i18n";

/** The home hub content: title, the two pillars, footer links, and settings. */
export default function HomeHub() {
  const { lang, switchLang, t, dir } = useLanguage();

  return (
    <div dir={dir} className="bg-app-dark flex flex-1 flex-col items-center justify-center px-5 py-8 sm:py-12">
      <SettingsMenu t={t} lang={lang} onSwitchLang={switchLang} />

      {/* Small corner delight: gift an ayah to someone. */}
      <Link
        href="/gift/new"
        className="lift glass-strong fixed right-3 top-3 z-50 flex h-10 items-center gap-1.5 rounded-full px-3 text-emerald-200 shadow-md transition hover:text-white sm:right-4 sm:top-4 sm:h-11"
      >
        <span className="text-lg">🎁</span>
        <span className="hidden text-xs font-medium sm:inline">{t("sendAyah")}</span>
      </Link>

      <header className="animate-rise-in mb-6 w-full max-w-2xl text-center sm:mb-10">
        <h1 dir="ltr" className="font-display text-4xl font-bold tracking-tight text-white sm:text-6xl">
          Ru<span className="text-emerald-300">sookh</span>
        </h1>
        <div className="mx-auto mt-2 h-px w-20 bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent sm:mt-3 sm:w-24" />
        <p className="mx-auto mt-3 max-w-md text-sm text-white/60 sm:mt-4 sm:text-base">{t("tagline")}</p>
      </header>

      <div className="grid w-full max-w-4xl grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-5">
        <Link
          href="/reels"
          className="lift glass animate-rise-in group flex items-center gap-4 rounded-2xl px-5 py-4 text-start sm:flex-col sm:gap-3 sm:rounded-3xl sm:py-8 sm:text-center"
        >
          <span className="text-4xl transition group-hover:scale-110 sm:text-5xl">📿</span>
          <span className="flex flex-1 flex-col sm:items-center">
            <span className="font-display text-lg font-bold text-white sm:text-2xl">{t("reelsTitle")}</span>
            <span className="text-xs text-white/55 sm:mt-1 sm:text-sm">{t("reelsDesc")}</span>
            <span className="mt-2 hidden rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white transition group-hover:bg-white/20 sm:inline-block">
              {t("reelsOpen")}
            </span>
          </span>
          <span className="text-xl text-white/60 sm:hidden">{dir === "rtl" ? "←" : "→"}</span>
        </Link>

        <Link
          href="/study"
          className="lift animate-rise-in emerald-glow group flex items-center gap-4 rounded-2xl border border-emerald-400/40 bg-gradient-to-b from-emerald-500/20 to-emerald-600/5 px-5 py-4 text-start sm:flex-col sm:gap-3 sm:rounded-3xl sm:py-8 sm:text-center"
        >
          <span className="text-4xl transition group-hover:scale-110 sm:text-5xl">📖</span>
          <span className="flex flex-1 flex-col sm:items-center">
            <span className="font-display text-lg font-bold text-white sm:text-2xl">{t("studyTitle")}</span>
            <span className="text-xs text-white/60 sm:mt-1 sm:text-sm">{t("studyDesc")}</span>
            <span className="mt-2 hidden rounded-full bg-emerald-500 px-4 py-1.5 text-sm font-semibold text-emerald-950 transition group-hover:bg-emerald-400 sm:inline-block">
              {t("studyOpen")}
            </span>
          </span>
          <span className="text-xl text-emerald-300 sm:hidden">{dir === "rtl" ? "←" : "→"}</span>
        </Link>

        <Link
          href="/feel"
          className="lift glass animate-rise-in group flex items-center gap-4 rounded-2xl border border-amber-300/25 px-5 py-4 text-start sm:flex-col sm:gap-3 sm:rounded-3xl sm:py-8 sm:text-center"
        >
          <span className="text-4xl transition group-hover:scale-110 sm:text-5xl">🕊️</span>
          <span className="flex flex-1 flex-col sm:items-center">
            <span className="font-display text-lg font-bold text-white sm:text-2xl">{t("feelTitle")}</span>
            <span className="text-xs text-white/55 sm:mt-1 sm:text-sm">{t("feelDesc")}</span>
            <span className="mt-2 hidden rounded-full bg-amber-300/15 px-4 py-1.5 text-sm font-semibold text-amber-100 transition group-hover:bg-amber-300/25 sm:inline-block">
              {t("feelOpen")}
            </span>
          </span>
          <span className="text-xl text-amber-200/80 sm:hidden">{dir === "rtl" ? "←" : "→"}</span>
        </Link>
      </div>

      <p className="animate-rise-in mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-white/45 sm:mt-8 sm:text-sm">
        <span>
          {t("newHere")}{" "}
          <Link href="/waitlist" className="text-emerald-300 underline underline-offset-2 hover:text-emerald-200">
            {t("signInFree")}
          </Link>
        </span>
        <Link href="/feedback" className="text-emerald-300 underline underline-offset-2 hover:text-emerald-200">
          {t("reviews")}
        </Link>
      </p>
    </div>
  );
}
