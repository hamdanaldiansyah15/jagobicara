import prisma from "@/lib/db/prisma";
import { calculateLeaderboardScore } from "@/lib/leaderboard/score";
import { getSeasonKey as getCurrentSeasonKey } from "@/lib/leaderboard/calendar";
export {
  getPreviousSeasonKey,
  getSeasonKey as getCurrentSeasonKey,
  getSeasonName as getCurrentSeasonName,
  getSeasonCountdown,
  getSeasonNameFromKey,
  getSeasonDateParts,
} from "@/lib/leaderboard/calendar";
export { calculateLeaderboardScore } from "@/lib/leaderboard/score";

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  communityName: string;
  score: number;
  bestAttempts: number[];
  bestScore: number;
  validAttemptsCount: number;
  isProvisional: boolean;
}

/**
 * Leaderboard points = highest valid attempt score x valid attempt count in the season.
 */
export async function getSeasonLeaderboardSnapshot(options?: {
  communityId?: string;
  seasonKey?: string;
}): Promise<LeaderboardEntry[]> {
  const seasonKey = options?.seasonKey || getCurrentSeasonKey();

  // Fetch valid speaking attempts in the given season
  const attempts = await prisma.speakingAttempt.findMany({
    where: {
      seasonKey,
      OR: [
        { valid: true },
        { finalScore: { gt: 0 } },
      ],
      user: {
        isActive: true,
        ...(options?.communityId
          ? {
              communityMembers: {
                some: { communityId: options.communityId },
              },
            }
          : {}),
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          communityMembers: {
            include: {
              community: {
                select: { name: true },
              },
            },
          },
        },
      },
    },
    orderBy: {
      finalScore: "desc",
    },
  });

  // Group attempts by user
  const userAttemptsMap = new Map<
    string,
    {
      userId: string;
      name: string;
      communityName: string;
      scores: number[];
    }
  >();

  for (const attempt of attempts) {
    const userId = attempt.user.id;
    if (!userAttemptsMap.has(userId)) {
      const communityName = options?.communityId
        ? attempt.user.communityMembers.find((membership) => membership.communityId === options.communityId)?.community?.name || "Independen"
        : attempt.user.communityMembers[0]?.community?.name || "Independen";
      userAttemptsMap.set(userId, {
        userId,
        name: attempt.user.name,
        communityName,
        scores: [],
      });
    }
    userAttemptsMap.get(userId)!.scores.push(attempt.finalScore);
  }

  // Calculate scores
  const rankedUsers: Omit<LeaderboardEntry, "rank">[] = [];

  userAttemptsMap.forEach((userData) => {
    // Sort descending
    const sortedScores = [...userData.scores].sort((a, b) => b - a);
    const validCount = sortedScores.length;

    if (validCount === 0) return;

    const bestScore = sortedScores[0];
    const computedScore = calculateLeaderboardScore(bestScore, validCount);

    rankedUsers.push({
      userId: userData.userId,
      name: userData.name,
      communityName: userData.communityName,
      score: computedScore,
      bestScore,
      bestAttempts: sortedScores.slice(0, 2),
      validAttemptsCount: validCount,
      isProvisional: false,
    });
  });

  // Sort by score descending, then by count of valid attempts descending
  rankedUsers.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.bestScore !== a.bestScore) return b.bestScore - a.bestScore;
    return a.name.localeCompare(b.name, "id");
  });

  return rankedUsers.map((user, index) => ({
    rank: index + 1,
    ...user,
  }));
}

export async function getSeasonLeaderboard(options?: {
  communityId?: string;
  seasonKey?: string;
  limit?: number;
}): Promise<LeaderboardEntry[]> {
  const rankings = await getSeasonLeaderboardSnapshot(options);
  return rankings.slice(0, options?.limit ?? 10);
}
