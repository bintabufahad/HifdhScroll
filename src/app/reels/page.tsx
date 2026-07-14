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
        <p className="mt-2 text-sm text-white/45">
          <Link href="/" className="text-emerald-300 underline underline-offset-2 hover:text-emerald-200">
            ← Home
          </Link>
        </p>
      </header>
      <div className="animate-rise-in">
        <SetupForm />
      </div>
    </div>
  );
}
