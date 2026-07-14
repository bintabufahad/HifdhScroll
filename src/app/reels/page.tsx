import Link from "next/link";
import SetupForm from "@/components/SetupForm";

export default function ReelsSetupPage() {
  return (
    <div className="bg-app-dark flex flex-1 flex-col px-6 py-10 sm:py-16">
      <header className="animate-rise-in mx-auto mb-10 w-full max-w-xl text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight text-white">
          Quran <span className="text-emerald-300">Reels</span>
        </h1>
        <div className="mx-auto mt-3 h-px w-24 bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent" />
        <p className="mt-4 text-white/60">
          Pick a surah, page, or ayah range — generate a set of short reels with Arabic text, translation, and
          recitation, each in its own scenery.
        </p>
        <div className="mt-4 flex justify-center">
          <Link
            href="/"
            className="lift inline-flex items-center gap-1 rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
          >
            ← Home
          </Link>
        </div>
      </header>
      <div className="animate-rise-in">
        <SetupForm />
      </div>
    </div>
  );
}
