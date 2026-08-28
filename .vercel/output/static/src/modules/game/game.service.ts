import { prisma } from "../../lib/prisma";

export class GameService {
  // game history
  async getHistory(userId: string) {
    return prisma.gameResult.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  // best score
  async getBestScore(userId: string) {
    return prisma.gameResult.findFirst({
      where: { userId },
      orderBy: { totalTimeMs: "asc" },
    });
  }

  // leaderboard
  async getLeaderboard(limit: number) {
    const rows = await prisma.$queryRaw<
      { playerName: string; bestTimeMs: number; rank: number }[]
    >`
    SELECT 
      u.name as "playerName",
      MIN(g."totalTimeMs")::int as "bestTimeMs",
      (ROW_NUMBER() OVER (ORDER BY MIN(g."totalTimeMs") ASC))::int as rank
    FROM "GameResult" g
    JOIN "user" u ON g."userId" = u.id
    GROUP BY u.id, u.name
    ORDER BY "bestTimeMs" ASC
    LIMIT ${limit}
  `;

    return rows.map((row) => ({
      playerName: row.playerName,
      bestTimeMs: Number(row.bestTimeMs),
      rank: Number(row.rank),
    }));
  }

  // submit result
  async submitResult(
    userId: string,
    input: {
      correctChars: number;
      wrongAttempts: number;
      rawTimeMs: number;
      wpmTimeline: number[];
      characterTimeline?: number[];
    },
  ) {
    const penaltyMs = input.wrongAttempts * 500;
    const totalTimeMs = input.rawTimeMs + penaltyMs;

    const totalAttempts = input.correctChars + input.wrongAttempts;
    const accuracy =
      totalAttempts > 0 ? (input.correctChars / totalAttempts) * 100 : 0;

    return await prisma.gameResult.create({
      data: {
        userId,
        correctChars: input.correctChars,
        wrongAttempts: input.wrongAttempts,
        rawTimeMs: input.rawTimeMs,
        penaltyMs,
        totalTimeMs,
        accuracy,
        wpmTimeline: input.wpmTimeline,
        characterTimeline: input.characterTimeline || [],
      },
    });
  }
}

// Singleton instance
export const gameService = new GameService();
