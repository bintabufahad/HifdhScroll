import { getBadges } from "@/lib/gamification";
import type { ProfileStats } from "@/lib/types";

export default function GamificationBar({ stats }: { stats: ProfileStats }) {
  const badges = getBadges(stats.points, stats.longest_streak);
  const hours = Math.floor(stats.total_study_seconds / 3600);
  const minutes = Math.floor((stats.total_study_seconds % 3600) / 60);

  return (
    <div className="rounded-2xl border border-[#c9a15d]/40 bg-[#faf3e2] p-4">
      <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
        <Stat label="Points" value={stats.points} />
        <Stat label="Day streak" value={stats.current_streak} />
        <Stat label="Best streak" value={stats.longest_streak} />
        <Stat label="Total studied" value={`${hours}h ${minutes}m`} />
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {badges.map((b) => (
          <span
            key={b.id}
            title={b.hint}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              b.achieved
                ? "border-[#c9a15d] bg-[#c9a15d]/30 text-[#3b2a1a]"
                : "border-[#c9a15d]/20 bg-transparent text-[#7a5a30]/50"
            }`}
          >
            {b.achieved ? "🏅 " : "🔒 "}
            {b.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="font-display text-2xl font-bold text-[#3b2a1a]">{value}</p>
      <p className="text-xs uppercase tracking-widest text-[#7a5a30]">{label}</p>
    </div>
  );
}
