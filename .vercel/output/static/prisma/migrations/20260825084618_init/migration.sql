-- CreateTable
CREATE TABLE "GameResult" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalTimeMs" INTEGER NOT NULL,
    "correctChars" INTEGER NOT NULL,
    "wrongAttempts" INTEGER NOT NULL,
    "penaltyMs" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GameResult_userId_idx" ON "GameResult"("userId");

-- CreateIndex
CREATE INDEX "GameResult_totalTimeMs_idx" ON "GameResult"("totalTimeMs");
