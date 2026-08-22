/*
  Warnings:

  - You are about to drop the column `caseLot` on the `Load` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Load" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loadNumber" INTEGER NOT NULL DEFAULT 1,
    "variantLetter" TEXT NOT NULL DEFAULT 'A',
    "name" TEXT,
    "firearmId" TEXT NOT NULL,
    "caseBrand" TEXT,
    "caseLoadCount" INTEGER,
    "sizingDie" TEXT,
    "shoulderBumpMm" REAL,
    "bushingDiameterMm" REAL,
    "mandrelDiameterMm" REAL,
    "primer" TEXT,
    "powder" TEXT,
    "chargeGrains" REAL NOT NULL,
    "bullet" TEXT,
    "bulletWeightGr" REAL,
    "oalMm" REAL,
    "cbtoMm" REAL,
    "crimpInfo" TEXT,
    "notes" TEXT,
    "parentLoadId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Load_firearmId_fkey" FOREIGN KEY ("firearmId") REFERENCES "Firearm" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Load_parentLoadId_fkey" FOREIGN KEY ("parentLoadId") REFERENCES "Load" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);
INSERT INTO "new_Load" ("bullet", "bulletWeightGr", "bushingDiameterMm", "caseBrand", "cbtoMm", "chargeGrains", "createdAt", "crimpInfo", "firearmId", "id", "mandrelDiameterMm", "name", "notes", "oalMm", "parentLoadId", "powder", "primer", "shoulderBumpMm", "sizingDie", "updatedAt") SELECT "bullet", "bulletWeightGr", "bushingDiameterMm", "caseBrand", "cbtoMm", "chargeGrains", "createdAt", "crimpInfo", "firearmId", "id", "mandrelDiameterMm", "name", "notes", "oalMm", "parentLoadId", "powder", "primer", "shoulderBumpMm", "sizingDie", "updatedAt" FROM "Load";
DROP TABLE "Load";
ALTER TABLE "new_Load" RENAME TO "Load";
CREATE INDEX "Load_firearmId_idx" ON "Load"("firearmId");
CREATE INDEX "Load_parentLoadId_idx" ON "Load"("parentLoadId");
CREATE UNIQUE INDEX "Load_loadNumber_variantLetter_key" ON "Load"("loadNumber", "variantLetter");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
