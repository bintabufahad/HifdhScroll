"use client";

import Link from "next/link";
import { feelings } from "@/lib/feelings";
import { useLanguage } from "@/lib/i18n";

/**
 * The emotional mushaf: the Qur'an organized by the moment you're in. Public on
 * purpose - these collections are made to be opened from a shared link.
 */
export default function FeelPage() {
  const { t, lang, dir } = useLanguage();

  return (
    <div dir={dir} className="bg-app-dark flex min-h-[100dvh] flex-col items-center px-5 py-8 sm:py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-6 flex items-center gap-3 sm:mb-8">
          <Link
            href="/"
            className="lift inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500 px-4 py-1.5 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
          >
            {dir === "rtl" ? "→" : "←"} {t("home")}
          </Link>
        </div>

        <header className="animate-rise-in mb-6 text-center sm:mb-10">
          <h1 className="font-display text-2xl font-bold text-white sm:text-4xl">
            {t("feelHeadingA")} <span className="text-emerald-300">{t("feelHeadingB")}</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/60">{t("feelSubtitle")}</p>
        </header>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {feelings.map((f, i) => (
            <Link
              key={f.id}
              href={`/feel/${f.id}`}
              className="lift glass animate-rise-in group flex aspect-[3/2] flex-col justify-between rounded-2xl p-4 transition hover:border-emerald-400/40 hover:bg-emerald-500/[0.08]"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="text-2xl transition group-hover:scale-110 sm:text-3xl">{f.emoji}</span>
              <span>
                <span className="block font-display text-sm font-semibold leading-tight text-white sm:text-base">
                  {lang === "ar" ? f.labelArabic : f.label}
                </span>
                <span className={`mt-0.5 block text-xs text-emerald-300/80 ${lang === "ar" ? "" : "font-arabic"}`}>
                  {lang === "ar" ? f.label : f.labelArabic}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
