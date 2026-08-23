import { computeVelocityStats } from "@/lib/stats/velocity-stats";

export interface LoadSessionGroupInput {
  sessionId: string;
  sessionDate: Date;
  sessionLocation: string | null;
  tempC: number | null;
  pressureHPa: number | null;
  humidityPct: number | null;
  extremeSpreadMm: number | null;
  velocitiesMps: number[];
}

export interface LoadSessionRow {
  sessionId: string;
  date: Date;
  location: string | null;
  tempC: number | null;
  pressureHPa: number | null;
  humidityPct: number | null;
  avgMps: number | null;
  sdMps: number | null;
  esMps: number | null;
  shotCount: number;
  meanExtremeSpreadMm: number | null;
  groupCount: number;
}

/** One load's shot groups, aggregated per session instead of across all
 *  sessions — lets a fixed charge weight's velocity be compared across the
 *  conditions (temperature, …) each session was shot under, which a single
 *  all-sessions average would hide. */
export function buildLoadSessionBreakdown(groups: LoadSessionGroupInput[]): LoadSessionRow[] {
  const bySession = new Map<string, LoadSessionGroupInput[]>();
  for (const g of groups) {
    const list = bySession.get(g.sessionId);
    if (list) list.push(g);
    else bySession.set(g.sessionId, [g]);
  }

  return Array.from(bySession.values())
    .map((sessionGroups): LoadSessionRow => {
      const first = sessionGroups[0];
      const velocitiesMps = sessionGroups.flatMap((g) => g.velocitiesMps);
      const extremeSpreadsMm = sessionGroups.map((g) => g.extremeSpreadMm).filter((v): v is number => v != null);
      const stats = computeVelocityStats(velocitiesMps);

      return {
        sessionId: first.sessionId,
        date: first.sessionDate,
        location: first.sessionLocation,
        tempC: first.tempC,
        pressureHPa: first.pressureHPa,
        humidityPct: first.humidityPct,
        avgMps: stats?.avgMps ?? null,
        sdMps: stats?.sdMps ?? null,
        esMps: stats?.esMps ?? null,
        shotCount: velocitiesMps.length,
        meanExtremeSpreadMm: extremeSpreadsMm.length
          ? extremeSpreadsMm.reduce((sum, v) => sum + v, 0) / extremeSpreadsMm.length
          : null,
        groupCount: extremeSpreadsMm.length,
      };
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}
