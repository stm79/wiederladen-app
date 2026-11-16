-- CreateTable
CREATE TABLE "CaseLot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "caliber" TEXT,
    "quantity" INTEGER,
    "purchasedAt" DATETIME,
    "retired" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CaseLot_number_key" ON "CaseLot"("number");

-- AlterTable
ALTER TABLE "Load" ADD COLUMN "caseLotId" TEXT REFERENCES "CaseLot" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Load_caseLotId_idx" ON "Load"("caseLotId");
