/*
  Warnings:

  - Added the required column `accuracy` to the `GameResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `finalTimeMs` to the `GameResult` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GameResult" ADD COLUMN     "accuracy" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "characterTimeline" INTEGER[],
ADD COLUMN     "finalTimeMs" INTEGER NOT NULL,
ADD COLUMN     "wpmTimeline" DOUBLE PRECISION[];

-- CreateIndex
CREATE INDEX "GameResult_createdAt_idx" ON "GameResult"("createdAt");
