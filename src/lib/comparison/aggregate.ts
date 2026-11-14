import { computeVelocityStats } from "@/lib/stats/velocity-stats";
import { loadDisplayName } from "@/lib/loads/label";
import { formatLoadNumber } from "@/lib/loads/variant-letter";

export interface LoadComparisonRow {
  loadId: string;
  loadLabel: string;
  /** Just the load number ("#001A") — for chart axes, where the full label
   *  doesn't fit. Unique per load. */
  loadNumberLabel: string;
  firearmId: string;
  firearmName: string;
  caliber: string;
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
  loadNumber: number;
  variantLetter: string;
  firearmId: string;
  firearmName: string;
  caliber: string;
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
    loadLabel: `${formatLoadNumber(load.loadNumber, load.variantLetter)} ${loadDisplayName(load)}`,
    loadNumberLabel: formatLoadNumber(load.loadNumber, load.variantLetter),
    firearmId: load.firearmId,
    firearmName: load.firearmName,
    caliber: load.caliber,
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
