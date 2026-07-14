import { getBadges } from "@/lib/gamification";
import type { ProfileStats } from "@/lib/types";

export default function GamificationBar({ stats }: { stats: ProfileStats }) {
  const badges = getBadges(stats.points, stats.longest_streak);
  const hours = Math.floor(stats.total_study_seconds / 3600);
  const minutes = Math.floor((stats.total_study_seconds % 3600) / 60);

  return (
    <div className="glass rounded-2xl p-4">
      <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
        <Stat label="Points" value={stats.points} accent />
        <Stat label="Day streak" value={`${stats.current_streak}🔥`} />
        <Stat label="Best streak" value={stats.longest_streak} />
        <Stat label="Total studied" value={`${hours}h ${minutes}m`} />
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {badges.map((b) => (
          <span
            key={b.id}
            title={b.hint}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              b.achieved
                ? "badge-glow border-amber-300/50 bg-amber-300/15 text-amber-200"
                : "border-white/10 bg-transparent text-white/30"
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

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div>
      <p className={`font-display text-2xl font-bold ${accent ? "text-emerald-300" : "text-white"}`}>{value}</p>
      <p className="text-xs uppercase tracking-widest text-white/45">{label}</p>
    </div>
  );
}
