/*
  Warnings:

  - Added the required column `rawTimeMs` to the `GameResult` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GameResult" ADD COLUMN     "rawTimeMs" INTEGER NOT NULL;
