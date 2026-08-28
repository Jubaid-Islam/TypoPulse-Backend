// src/modules/game/game.resolver.ts
import { GraphQLError } from "graphql";
import { gameService } from "./game.service";
import { submitGameResultSchema, leaderboardLimitSchema, validateOrThrow, } from "../../validation/schemas";
export const gameResolvers = {
    Query: {
        // game history
        myGameHistory: async (_parent, _args, context) => {
            if (!context.userId) {
                throw new GraphQLError("User is not authenticated", {
                    extensions: { code: "UNAUTHENTICATED" },
                });
            }
            return gameService.getHistory(context.userId);
        },
        // best score
        myBestScore: async (_parent, _args, context) => {
            if (!context.userId) {
                throw new GraphQLError("User is not authenticated", {
                    extensions: { code: "UNAUTHENTICATED" },
                });
            }
            return gameService.getBestScore(context.userId);
        },
        // leaderboard
        leaderboard: async (_parent, { limit }) => {
            // zod validation
            const validated = validateOrThrow(leaderboardLimitSchema, { limit });
            return gameService.getLeaderboard(validated.limit);
        },
    },
    Mutation: {
        submitGameResult: async (_parent, { input }, context) => {
            if (!context.userId) {
                throw new GraphQLError("User is not authenticated", {
                    extensions: { code: "UNAUTHENTICATED" },
                });
            }
            // zod validation
            const validated = validateOrThrow(submitGameResultSchema, input);
            try {
                const result = await gameService.submitResult(context.userId, validated);
                return result;
            }
            catch (error) {
                if (error instanceof GraphQLError) {
                    throw error;
                }
                console.error("Submit game result error:", error);
                throw new GraphQLError("Failed to submit game result. Please try again.", {
                    extensions: { code: "INTERNAL_ERROR" },
                });
            }
        },
    },
    GameResult: {
        createdAt: (parent) => {
            if (!parent.createdAt)
                return new Date().toISOString();
            if (parent.createdAt instanceof Date) {
                return parent.createdAt.toISOString();
            }
            return new Date(parent.createdAt).toISOString();
        },
    },
};
//# sourceMappingURL=game.resolver.js.map