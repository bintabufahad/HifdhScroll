import Link from "next/link";

export default function Home() {
  return (
    <div className="paper-texture flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-[#efe4c8] via-[#e8dcc0] to-[#ddcda3] px-6 py-12">
      <header className="animate-rise-in mb-10 w-full max-w-2xl text-center">
        <h1 className="font-display text-5xl font-bold tracking-tight text-[#3b2a1a] sm:text-6xl">HifdhScroll</h1>
        <div className="mx-auto mt-3 h-px w-24 bg-[#c9a15d]" />
        <p className="mt-4 text-[#5a4530]">
          Your companion for the Qur&apos;an — memorize through short reels, and study with focus as a student of
          knowledge.
        </p>
      </header>

      <div className="grid w-full max-w-2xl grid-cols-1 gap-5 sm:grid-cols-2">
        <Link
          href="/reels"
          className="lift animate-rise-in group flex flex-col items-center gap-3 rounded-3xl border-2 border-[#c9a15d] bg-[#faf3e2] px-6 py-10 text-center shadow-md"
        >
          <span className="text-5xl transition group-hover:scale-110">📿</span>
          <span className="font-display text-2xl font-bold text-[#3b2a1a]">Quran Reels</span>
          <span className="text-sm text-[#5a4530]">
            Scroll short, looping ayah reels with recitation and scenery — built for memorization.
          </span>
          <span className="mt-1 rounded-full bg-[#7a2e2e] px-4 py-1.5 text-sm font-semibold text-[#f5ecd7] transition group-hover:bg-[#8a3a3a]">
            Open Reels →
          </span>
        </Link>

        <Link
          href="/study"
          className="lift animate-rise-in group flex flex-col items-center gap-3 rounded-3xl border-2 border-[#c9a15d] bg-[#7a2e2e] px-6 py-10 text-center text-[#f5ecd7] shadow-md"
        >
          <span className="text-5xl transition group-hover:scale-110">📖</span>
          <span className="font-display text-2xl font-bold">Student of Knowledge</span>
          <span className="text-sm text-[#f5ecd7]/80">
            A focused study space: simulated class, lecture &amp; course player, timer, to-do list, and points.
          </span>
          <span className="mt-1 rounded-full bg-[#faf3e2] px-4 py-1.5 text-sm font-semibold text-[#7a2e2e] transition group-hover:bg-white">
            Open Dashboard →
          </span>
        </Link>
      </div>

      <p className="animate-rise-in mt-8 text-sm text-[#7a5a30]">
        New here?{" "}
        <Link href="/waitlist" className="underline underline-offset-2 hover:text-[#7a2e2e]">
          Join the waitlist
        </Link>{" "}
        for a 14-day free trial.
      </p>
    </div>
  );
}
