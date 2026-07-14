import Link from "next/link";
import SetupForm from "@/components/SetupForm";

export default function ReelsSetupPage() {
  return (
    <div className="paper-texture flex flex-1 flex-col bg-gradient-to-b from-[#efe4c8] via-[#e8dcc0] to-[#ddcda3] px-6 py-10 sm:py-16">
      <header className="animate-rise-in mx-auto mb-10 w-full max-w-xl text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight text-[#3b2a1a]">Quran Reels</h1>
        <div className="mx-auto mt-3 h-px w-24 bg-[#c9a15d]" />
        <p className="mt-4 text-[#5a4530]">
          Pick a surah, page, or ayah range — generate a set of short reels with Arabic text, translation, and
          recitation, each in its own scenery.
        </p>
        <p className="mt-2 text-sm text-[#7a5a30]">
          <Link href="/" className="underline underline-offset-2 hover:text-[#7a2e2e]">
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
