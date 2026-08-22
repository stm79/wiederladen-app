-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "weightUnit" TEXT NOT NULL DEFAULT 'grain',
    "lengthUnit" TEXT NOT NULL DEFAULT 'mm',
    "velocityUnit" TEXT NOT NULL DEFAULT 'mps',
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Firearm" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "caliber" TEXT NOT NULL,
    "barrelLenMm" REAL,
    "twistRate" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Load" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "firearmId" TEXT NOT NULL,
    "caseBrand" TEXT,
    "caseLot" TEXT,
    "primerBrand" TEXT,
    "primerType" TEXT,
    "powderBrand" TEXT,
    "powderType" TEXT,
    "chargeGrains" REAL NOT NULL,
    "bulletBrand" TEXT,
    "bulletType" TEXT,
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

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "location" TEXT,
    "tempC" REAL,
    "pressureHPa" REAL,
    "humidityPct" REAL,
    "distanceM" REAL,
    "firearmId" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Session_firearmId_fkey" FOREIGN KEY ("firearmId") REFERENCES "Firearm" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SessionLoad" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "loadId" TEXT NOT NULL,
    CONSTRAINT "SessionLoad_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SessionLoad_loadId_fkey" FOREIGN KEY ("loadId") REFERENCES "Load" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ShotGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "loadId" TEXT,
    "distanceM" REAL,
    "extremeSpreadMm" REAL,
    "meanRadiusMm" REAL,
    "shotCount" INTEGER,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ShotGroup_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ShotGroup_loadId_fkey" FOREIGN KEY ("loadId") REFERENCES "Load" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GroupImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "calibration" TEXT,
    "shotPoints" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GroupImage_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ShotGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VelocitySet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "loadId" TEXT,
    "sourceDevice" TEXT NOT NULL,
    "rawFileName" TEXT,
    "importedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "avgMps" REAL,
    "sdMps" REAL,
    "esMps" REAL,
    CONSTRAINT "VelocitySet_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VelocitySet_loadId_fkey" FOREIGN KEY ("loadId") REFERENCES "Load" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VelocityShot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "velocitySetId" TEXT NOT NULL,
    "shotNumber" INTEGER NOT NULL,
    "velocityMps" REAL NOT NULL,
    CONSTRAINT "VelocityShot_velocitySetId_fkey" FOREIGN KEY ("velocitySetId") REFERENCES "VelocitySet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Load_firearmId_idx" ON "Load"("firearmId");

-- CreateIndex
CREATE INDEX "Load_parentLoadId_idx" ON "Load"("parentLoadId");

-- CreateIndex
CREATE INDEX "Session_firearmId_idx" ON "Session"("firearmId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionLoad_sessionId_loadId_key" ON "SessionLoad"("sessionId", "loadId");

-- CreateIndex
CREATE INDEX "ShotGroup_sessionId_idx" ON "ShotGroup"("sessionId");

-- CreateIndex
CREATE INDEX "ShotGroup_loadId_idx" ON "ShotGroup"("loadId");

-- CreateIndex
CREATE INDEX "GroupImage_groupId_idx" ON "GroupImage"("groupId");

-- CreateIndex
CREATE INDEX "VelocitySet_sessionId_idx" ON "VelocitySet"("sessionId");

-- CreateIndex
CREATE INDEX "VelocitySet_loadId_idx" ON "VelocitySet"("loadId");

-- CreateIndex
CREATE INDEX "VelocityShot_velocitySetId_idx" ON "VelocityShot"("velocitySetId");
