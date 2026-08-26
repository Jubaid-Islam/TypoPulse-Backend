import { describe, it, expect, beforeEach } from "bun:test";
import { mock } from "bun:test";
import { prismaMock, resetPrismaMock } from "../src/lib/__mocks__/prisma";

mock.module("../src/lib/prisma", () => ({
  prisma: prismaMock,
}));

const { gameService } = await import("../src/modules/game/game.service");

describe("GameService", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  describe("getHistory", () => {
    it("returns game results ordered by createdAt desc", async () => {
      const mockResults = [
        {
          id: "1",
          userId: "user-1",
          totalTimeMs: 46000,
          penaltyMs: 1000,
          rawTimeMs: 45000,
          correctChars: 18,
          wrongAttempts: 2,
          accuracy: 90,
          wpmTimeline: [30, 35, 40],
          characterTimeline: [500, 520, 480],
          createdAt: new Date(),
        },
      ];
      prismaMock.gameResult.findMany.mockResolvedValue(mockResults);

      const result = await gameService.getHistory("user-1");

      expect(result).toEqual(mockResults);
      expect(prismaMock.gameResult.findMany).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        orderBy: { createdAt: "desc" },
      });
    });
  });

  describe("getBestScore", () => {
    it("returns the result with lowest totalTimeMs", async () => {
      const mockBest = {
        id: "1",
        userId: "user-1",
        totalTimeMs: 5000,
        penaltyMs: 1000,
        rawTimeMs: 4000,
        correctChars: 18,
        wrongAttempts: 2,
        accuracy: 90,
        wpmTimeline: [30, 35, 40],
        characterTimeline: [500, 520, 480],
        createdAt: new Date(),
      };
      prismaMock.gameResult.findFirst.mockResolvedValue(mockBest);

      const result = await gameService.getBestScore("user-1");

      expect(result).toEqual(mockBest);
      expect(prismaMock.gameResult.findFirst).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        orderBy: { totalTimeMs: "asc" },
      });
    });

    it("returns null when user has no game results", async () => {
      prismaMock.gameResult.findFirst.mockResolvedValue(null);

      const result = await gameService.getBestScore("user-with-no-games");

      expect(result).toBeNull();
    });
  });

  describe("getLeaderboard", () => {
    it("returns ranked leaderboard entries", async () => {
      const mockLeaderboard = [
        { playerName: "Alice", bestTimeMs: 4000, rank: 1 },
        { playerName: "Bob", bestTimeMs: 5000, rank: 2 },
      ];
      prismaMock.$queryRaw.mockResolvedValue(mockLeaderboard);

      const result = await gameService.getLeaderboard(10);

      expect(result).toEqual(mockLeaderboard);
      expect(prismaMock.$queryRaw).toHaveBeenCalled();
    });
  });

  describe("submitResult", () => {
    const baseInput = {
      correctChars: 18,
      wrongAttempts: 2,
      rawTimeMs: 45000,
      wpmTimeline: [30, 35, 40],
      characterTimeline: [500, 520, 480],
    };

    it("calculates penaltyMs, totalTimeMs and accuracy correctly", async () => {
      prismaMock.gameResult.create.mockImplementation(({ data }: any) =>
        Promise.resolve({ id: "result-1", ...data }),
      );

      const result = await gameService.submitResult("user-1", baseInput);

      expect(result.penaltyMs).toBe(1000); // 2 * 500
      expect(result.totalTimeMs).toBe(46000); // 45000 + 1000
      expect(result.accuracy).toBe(90); // 18 / (18+2) * 100
    });

    it("handles zero correctChars and zero wrongAttempts without NaN", async () => {
      prismaMock.gameResult.create.mockImplementation(({ data }: any) =>
        Promise.resolve({ id: "result-1", ...data }),
      );

      const result = await gameService.submitResult("user-1", {
        ...baseInput,
        correctChars: 0,
        wrongAttempts: 0,
      });

      expect(result.accuracy).toBe(0);
      expect(Number.isNaN(result.accuracy)).toBe(false);
    });

    it("defaults characterTimeline to empty array when not provided", async () => {
      prismaMock.gameResult.create.mockImplementation(({ data }: any) =>
        Promise.resolve({ id: "result-1", ...data }),
      );

      const { characterTimeline, ...inputWithoutTimeline } = baseInput;
      const result = await gameService.submitResult(
        "user-1",
        inputWithoutTimeline as any,
      );

      expect(result.characterTimeline).toEqual([]);
    });
  });
});
