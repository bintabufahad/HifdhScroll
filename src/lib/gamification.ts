export interface Badge {
  id: string;
  label: string;
  achieved: boolean;
  hint: string;
}

const POINT_MILESTONES = [
  { id: "starter", label: "Starter", points: 50 },
  { id: "dedicated", label: "Dedicated", points: 250 },
  { id: "devoted", label: "Devoted", points: 1000 },
  { id: "scholar-track", label: "On the Scholar's Track", points: 5000 },
];

const STREAK_MILESTONES = [
  { id: "streak-3", label: "3-Day Streak", days: 3 },
  { id: "streak-7", label: "7-Day Streak", days: 7 },
  { id: "streak-30", label: "30-Day Streak", days: 30 },
  { id: "streak-100", label: "100-Day Streak", days: 100 },
];

export function getBadges(points: number, longestStreak: number): Badge[] {
  const pointBadges = POINT_MILESTONES.map((m) => ({
    id: m.id,
    label: m.label,
    achieved: points >= m.points,
    hint: `Earn ${m.points} points`,
  }));
  const streakBadges = STREAK_MILESTONES.map((m) => ({
    id: m.id,
    label: m.label,
    achieved: longestStreak >= m.days,
    hint: `Study ${m.days} days in a row`,
  }));
  return [...pointBadges, ...streakBadges];
}
