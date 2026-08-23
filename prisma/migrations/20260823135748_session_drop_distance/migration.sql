-- AlterTable
-- Redundant with ShotGroup.distanceM, which is captured per shot group anyway.
ALTER TABLE "Session" DROP COLUMN "distanceM";
