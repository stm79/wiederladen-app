-- CreateTable
CREATE TABLE "SessionFirearm" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "firearmId" TEXT NOT NULL,
    CONSTRAINT "SessionFirearm_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SessionFirearm_firearmId_fkey" FOREIGN KEY ("firearmId") REFERENCES "Firearm" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "SessionFirearm_sessionId_firearmId_key" ON "SessionFirearm"("sessionId", "firearmId");

-- Backfill: each session's old single firearmId becomes its first
-- SessionFirearm row.
INSERT INTO "SessionFirearm" ("id", "sessionId", "firearmId")
SELECT
  lower(hex(randomblob(4))) || lower(hex(randomblob(4))) || lower(hex(randomblob(4))) || lower(hex(randomblob(4))),
  "id",
  "firearmId"
FROM "Session"
WHERE "firearmId" IS NOT NULL;

-- RedefineTables
-- Session.firearmId is a child FK column, so a plain DROP COLUMN isn't
-- allowed — SQLite requires the full table-rebuild dance.
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "location" TEXT,
    "tempC" REAL,
    "pressureHPa" REAL,
    "humidityPct" REAL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Session" ("id", "date", "location", "tempC", "pressureHPa", "humidityPct", "notes", "createdAt", "updatedAt")
SELECT "id", "date", "location", "tempC", "pressureHPa", "humidityPct", "notes", "createdAt", "updatedAt" FROM "Session";
DROP TABLE "Session";
ALTER TABLE "new_Session" RENAME TO "Session";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
