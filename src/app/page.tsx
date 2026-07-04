import SetupForm from "@/components/SetupForm";

export default function Home() {
  return (
    <div className="paper-texture flex flex-1 flex-col bg-gradient-to-b from-[#efe4c8] via-[#e8dcc0] to-[#ddcda3] px-6 py-10 sm:py-16">
      <header className="w-full max-w-xl mx-auto text-center mb-10">
        <h1 className="font-display text-5xl font-bold text-[#3b2a1a] tracking-tight">HifdhScroll</h1>
        <div className="mx-auto mt-3 h-px w-24 bg-[#c9a15d]" />
        <p className="mt-4 text-[#5a4530]">
          Pick a surah, page, or ayah range — generate a set of short reels with Arabic text, translation, and
          recitation, each in its own scenery.
        </p>
      </header>
      <SetupForm />
    </div>
  );
}
