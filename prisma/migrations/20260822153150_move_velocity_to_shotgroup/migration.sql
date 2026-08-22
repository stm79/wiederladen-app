/*
  Warnings:

  - You are about to drop the column `loadId` on the `VelocitySet` table. All the data in the column will be lost.
  - You are about to drop the column `sessionId` on the `VelocitySet` table. All the data in the column will be lost.
  - Added the required column `groupId` to the `VelocitySet` table without a default value. This is not possible if the table is not empty.

*/

-- Backfill: every VelocitySet needs a ShotGroup. Reuse an existing group in
-- the same session with the same load if one exists, otherwise create a
-- placeholder group (no photo/measurement yet) so the import isn't lost.
INSERT INTO "ShotGroup" ("id", "sessionId", "loadId", "source", "createdAt", "updatedAt")
SELECT
  lower(hex(randomblob(4))) || lower(hex(randomblob(4))) || lower(hex(randomblob(4))) || lower(hex(randomblob(4))),
  vs."sessionId",
  vs."loadId",
  'manual',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "VelocitySet" vs
WHERE NOT EXISTS (
  SELECT 1 FROM "ShotGroup" sg
  WHERE sg."sessionId" = vs."sessionId"
    AND (sg."loadId" = vs."loadId" OR (sg."loadId" IS NULL AND vs."loadId" IS NULL))
)
GROUP BY vs."sessionId", vs."loadId";

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_VelocitySet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupId" TEXT NOT NULL,
    "sourceDevice" TEXT NOT NULL,
    "rawFileName" TEXT,
    "importedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "avgMps" REAL,
    "sdMps" REAL,
    "esMps" REAL,
    CONSTRAINT "VelocitySet_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ShotGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_VelocitySet" ("id", "groupId", "sourceDevice", "rawFileName", "importedAt", "avgMps", "sdMps", "esMps")
SELECT
  vs."id",
  (
    SELECT sg."id" FROM "ShotGroup" sg
    WHERE sg."sessionId" = vs."sessionId"
      AND (sg."loadId" = vs."loadId" OR (sg."loadId" IS NULL AND vs."loadId" IS NULL))
    LIMIT 1
  ),
  vs."sourceDevice",
  vs."rawFileName",
  vs."importedAt",
  vs."avgMps",
  vs."sdMps",
  vs."esMps"
FROM "VelocitySet" vs;
DROP TABLE "VelocitySet";
ALTER TABLE "new_VelocitySet" RENAME TO "VelocitySet";
CREATE INDEX "VelocitySet_groupId_idx" ON "VelocitySet"("groupId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
