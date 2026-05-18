/*
  Warnings:

  - You are about to drop the column `memberId` on the `workout_logs` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "workout_logs" DROP CONSTRAINT "workout_logs_memberId_fkey";

-- AlterTable
ALTER TABLE "workout_logs" DROP COLUMN "memberId";
