import SetupForm from "@/components/SetupForm";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-emerald-950 via-black to-black px-6 py-10 sm:py-16">
      <header className="w-full max-w-xl mx-auto text-center mb-10">
        <h1 className="text-4xl font-bold text-white tracking-tight">HifdhScroll</h1>
        <p className="mt-2 text-white/60">
          Pick a surah, page, or ayah range — get a scrollable reel with Arabic text, translation, and recitation.
        </p>
      </header>
      <SetupForm />
    </div>
  );
}
