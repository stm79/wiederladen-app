/*
  Warnings:

  - You are about to drop the column `bulletBrand` on the `Load` table. All the data in the column will be lost.
  - You are about to drop the column `bulletType` on the `Load` table. All the data in the column will be lost.
  - You are about to drop the column `powderBrand` on the `Load` table. All the data in the column will be lost.
  - You are about to drop the column `powderType` on the `Load` table. All the data in the column will be lost.
  - You are about to drop the column `primerBrand` on the `Load` table. All the data in the column will be lost.
  - You are about to drop the column `primerType` on the `Load` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Load" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "firearmId" TEXT NOT NULL,
    "caseBrand" TEXT,
    "caseLot" TEXT,
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
INSERT INTO "new_Load" ("bulletWeightGr", "caseBrand", "caseLot", "cbtoMm", "chargeGrains", "createdAt", "crimpInfo", "firearmId", "id", "name", "notes", "oalMm", "parentLoadId", "updatedAt") SELECT "bulletWeightGr", "caseBrand", "caseLot", "cbtoMm", "chargeGrains", "createdAt", "crimpInfo", "firearmId", "id", "name", "notes", "oalMm", "parentLoadId", "updatedAt" FROM "Load";
DROP TABLE "Load";
ALTER TABLE "new_Load" RENAME TO "Load";
CREATE INDEX "Load_firearmId_idx" ON "Load"("firearmId");
CREATE INDEX "Load_parentLoadId_idx" ON "Load"("parentLoadId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
