import Link from "next/link";
import SetupForm from "@/components/SetupForm";

export default function ReelsSetupPage() {
  return (
    <div className="bg-app-dark flex flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12">
      <header className="animate-rise-in mx-auto mb-6 w-full max-w-xl text-center sm:mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Quran <span className="text-emerald-300">Reels</span>
        </h1>
        <div className="mx-auto mt-2 h-px w-20 bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent sm:mt-3 sm:w-24" />
        <p className="mx-auto mt-3 max-w-md text-sm text-white/60 sm:text-base">
          Pick a surah, page, or ayah range — generate short reels with Arabic text, translation, and recitation.
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
