import { computeVelocityStats } from "@/lib/stats/velocity-stats";

export interface LoadComparisonRow {
  loadId: string;
  loadLabel: string;
  firearmId: string;
  firearmName: string;
  powder: string | null;
  chargeGrains: number;
  bullet: string | null;
  bulletWeightGr: number | null;
  oalMm: number | null;
  avgMps: number | null;
  sdMps: number | null;
  esMps: number | null;
  shotCount: number;
  meanExtremeSpreadMm: number | null;
  groupCount: number;
}

export interface LoadForComparison {
  id: string;
  name: string | null;
  firearmId: string;
  firearmName: string;
  powder: string | null;
  chargeGrains: number;
  bullet: string | null;
  bulletWeightGr: number | null;
  oalMm: number | null;
  velocitiesMps: number[];
  extremeSpreadsMm: number[];
}

export function buildComparisonRow(load: LoadForComparison): LoadComparisonRow {
  const stats = computeVelocityStats(load.velocitiesMps);
  const meanExtremeSpreadMm = load.extremeSpreadsMm.length
    ? load.extremeSpreadsMm.reduce((sum, v) => sum + v, 0) / load.extremeSpreadsMm.length
    : null;

  return {
    loadId: load.id,
    loadLabel: load.name ?? (load.powder || "Ladung"),
    firearmId: load.firearmId,
    firearmName: load.firearmName,
    powder: load.powder,
    chargeGrains: load.chargeGrains,
    bullet: load.bullet,
    bulletWeightGr: load.bulletWeightGr,
    oalMm: load.oalMm,
    avgMps: stats?.avgMps ?? null,
    sdMps: stats?.sdMps ?? null,
    esMps: stats?.esMps ?? null,
    shotCount: load.velocitiesMps.length,
    meanExtremeSpreadMm,
    groupCount: load.extremeSpreadsMm.length,
  };
}
