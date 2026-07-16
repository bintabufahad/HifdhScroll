import Link from "next/link";
import { Suspense } from "react";
import AuthErrorNotice from "@/components/AuthErrorNotice";

export default function Home() {
  return (
    <div className="bg-app-dark flex flex-1 flex-col items-center justify-center px-5 py-8 sm:py-12">
      <Suspense fallback={null}>
        <AuthErrorNotice />
      </Suspense>
      <header className="animate-rise-in mb-6 w-full max-w-2xl text-center sm:mb-10">
        <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-6xl">
          Ru<span className="text-emerald-300">sookh</span>
        </h1>
        <div className="mx-auto mt-2 h-px w-20 bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent sm:mt-3 sm:w-24" />
        <p className="mx-auto mt-3 max-w-md text-sm text-white/60 sm:mt-4 sm:text-base">
          Your companion for the Qur&apos;an — memorize through short reels, and study with focus.
        </p>
      </header>

      <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
        <Link
          href="/reels"
          className="lift glass animate-rise-in group flex items-center gap-4 rounded-2xl px-5 py-4 text-left sm:flex-col sm:gap-3 sm:rounded-3xl sm:py-8 sm:text-center"
        >
          <span className="text-4xl transition group-hover:scale-110 sm:text-5xl">📿</span>
          <span className="flex flex-1 flex-col sm:items-center">
            <span className="font-display text-lg font-bold text-white sm:text-2xl">Quran Reels</span>
            <span className="text-xs text-white/55 sm:mt-1 sm:text-sm">
              Short, looping ayah reels with recitation and scenery — for memorization.
            </span>
            <span className="mt-2 hidden rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white transition group-hover:bg-white/20 sm:inline-block">
              Open Reels →
            </span>
          </span>
          <span className="text-xl text-white/60 sm:hidden">→</span>
        </Link>

        <Link
          href="/study"
          className="lift animate-rise-in emerald-glow group flex items-center gap-4 rounded-2xl border border-emerald-400/40 bg-gradient-to-b from-emerald-500/20 to-emerald-600/5 px-5 py-4 text-left sm:flex-col sm:gap-3 sm:rounded-3xl sm:py-8 sm:text-center"
        >
          <span className="text-4xl transition group-hover:scale-110 sm:text-5xl">📖</span>
          <span className="flex flex-1 flex-col sm:items-center">
            <span className="font-display text-lg font-bold text-white sm:text-2xl">Student of Knowledge</span>
            <span className="text-xs text-white/60 sm:mt-1 sm:text-sm">
              A focused study space: simulated class, lecture &amp; course player, timer, to-do list.
            </span>
            <span className="mt-2 hidden rounded-full bg-emerald-500 px-4 py-1.5 text-sm font-semibold text-emerald-950 transition group-hover:bg-emerald-400 sm:inline-block">
              Open Dashboard →
            </span>
          </span>
          <span className="text-xl text-emerald-300 sm:hidden">→</span>
        </Link>
      </div>

      <p className="animate-rise-in mt-6 text-xs text-white/45 sm:mt-8 sm:text-sm">
        New here?{" "}
        <Link href="/waitlist" className="text-emerald-300 underline underline-offset-2 hover:text-emerald-200">
          Join the waitlist
        </Link>{" "}
        for a 14-day free trial.
      </p>
    </div>
  );
}
