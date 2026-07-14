/** The placeholder "teacher" tile. `big` fills the main slot; otherwise it's a small aspect-video tile. */
export default function TeacherBox({ big = false }: { big?: boolean }) {
  return (
    <div
      className={`relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-[#0f2b23] to-[#05100d] ${
        big ? "h-full min-h-0" : "aspect-video"
      }`}
    >
      <svg viewBox="0 0 100 100" className={`text-emerald-400/70 ${big ? "h-24 w-24" : "h-14 w-14"}`} fill="none">
        <circle cx="50" cy="35" r="18" fill="currentColor" opacity="0.85" />
        <path d="M20 90c0-18 13.5-32 30-32s30 14 30 32" fill="currentColor" opacity="0.85" />
      </svg>
      <span className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/50 px-2 py-0.5 text-xs text-white/80">
        “Teacher” (demo)
      </span>
    </div>
  );
}
