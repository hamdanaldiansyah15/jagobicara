export function calculateLeaderboardScore(bestScore: number, validAttemptsCount: number) {
  return Math.max(0, bestScore) * Math.max(0, validAttemptsCount);
}