export function calculateBadges(profile, submissions) {
  const badges = [];
  
  // First solve badge
  if (profile.overallStats.totalSolved >= 1) {
    badges.push({
      name: 'First Solve',
      description: 'Solved your first problem',
      iconUrl: '/badges/first-solve.png'
    });
  }
  
  // Streak badges
  if (profile.streaks.maxStreak >= 7) {
    badges.push({
      name: 'Week Warrior',
      description: 'Maintained a 7-day solving streak',
      iconUrl: '/badges/week-warrior.png'
    });
  }
  
  return badges;
}
