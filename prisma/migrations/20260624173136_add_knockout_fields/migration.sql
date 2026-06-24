-- AlterEnum
ALTER TYPE "MatchStage" ADD VALUE 'THIRD_PLACE';

-- AlterTable
ALTER TABLE "matches" ADD COLUMN     "awayTeamLabel" TEXT,
ADD COLUMN     "homeTeamLabel" TEXT;
