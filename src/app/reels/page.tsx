import Link from "next/link";
import SetupForm from "@/components/SetupForm";

export default function ReelsSetupPage() {
  return (
    <div className="bg-app-dark flex flex-1 flex-col px-4 py-4 sm:px-6 sm:py-6">
      {/* Compact header: Home chip top-left + title inline, so the form sits high
          up and you don't have to scroll to reach Generate. */}
      <header className="animate-rise-in mx-auto mb-4 flex w-full max-w-xl items-center gap-3">
        <Link
          href="/"
          className="lift inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-emerald-950 transition hover:bg-emerald-400 sm:text-sm"
        >
          ← Home
        </Link>
        <h1 className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
          Quran <span className="text-emerald-300">Reels</span>
        </h1>
      </header>
      <div className="animate-rise-in">
        <SetupForm />
      </div>
    </div>
  );
}
