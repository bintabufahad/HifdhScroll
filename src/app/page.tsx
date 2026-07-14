import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-app-dark flex flex-1 flex-col items-center justify-center px-6 py-12">
      <header className="animate-rise-in mb-10 w-full max-w-2xl text-center">
        <h1 className="font-display text-5xl font-bold tracking-tight text-white sm:text-6xl">
          Hifdh<span className="text-emerald-300">Scroll</span>
        </h1>
        <div className="mx-auto mt-3 h-px w-24 bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent" />
        <p className="mt-4 text-white/60">
          Your companion for the Qur&apos;an — memorize through short reels, and study with focus as a student of
          knowledge.
        </p>
      </header>

      <div className="grid w-full max-w-2xl grid-cols-1 gap-5 sm:grid-cols-2">
        <Link
          href="/reels"
          className="lift glass animate-rise-in group flex flex-col items-center gap-3 rounded-3xl px-6 py-10 text-center"
        >
          <span className="text-5xl transition group-hover:scale-110">📿</span>
          <span className="font-display text-2xl font-bold text-white">Quran Reels</span>
          <span className="text-sm text-white/55">
            Scroll short, looping ayah reels with recitation and scenery — built for memorization.
          </span>
          <span className="mt-1 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white transition group-hover:bg-white/20">
            Open Reels →
          </span>
        </Link>

        <Link
          href="/study"
          className="lift animate-rise-in emerald-glow group flex flex-col items-center gap-3 rounded-3xl border border-emerald-400/40 bg-gradient-to-b from-emerald-500/20 to-emerald-600/5 px-6 py-10 text-center"
        >
          <span className="text-5xl transition group-hover:scale-110">📖</span>
          <span className="font-display text-2xl font-bold text-white">Student of Knowledge</span>
          <span className="text-sm text-white/60">
            A focused study space: simulated class, lecture &amp; course player, timer, to-do list, and points.
          </span>
          <span className="mt-1 rounded-full bg-emerald-500 px-4 py-1.5 text-sm font-semibold text-emerald-950 transition group-hover:bg-emerald-400">
            Open Dashboard →
          </span>
        </Link>
      </div>

      <p className="animate-rise-in mt-8 text-sm text-white/45">
        New here?{" "}
        <Link href="/waitlist" className="text-emerald-300 underline underline-offset-2 hover:text-emerald-200">
          Join the waitlist
        </Link>{" "}
        for a 14-day free trial.
      </p>
    </div>
  );
}
