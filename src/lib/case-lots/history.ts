/** Case lots ("Hülsen-Chargen"): a physical batch of cases reloaded over and
 *  over. A lot's history is simply the loads that used it, in date order;
 *  variants of one load (#017A, #017B, …) belong to the same loading cycle. */

export function formatCaseLotNumber(number: number): string {
  return `L-${String(number).padStart(2, "0")}`;
}

export function caseLotLabel(lot: { number: number; name: string }): string {
  return `${formatCaseLotNumber(lot.number)} · ${lot.name}`;
}

export interface LotLoad {
  id: string;
  loadNumber: number;
  variantLetter: string;
  caseLoadCount: number | null;
  createdAt: Date | string;
}

export interface LotCycle<T extends LotLoad> {
  loadNumber: number;
  /** Earliest date of the cycle's loads. */
  date: Date;
  /** The cycle's load count (highest one entered on any of its variants). */
  loadCount: number | null;
  loads: T[];
}

const time = (d: Date | string) => new Date(d).getTime();

/** Groups a lot's loads into loading cycles (one per load number), oldest first. */
export function caseLotCycles<T extends LotLoad>(loads: readonly T[]): LotCycle<T>[] {
  const byNumber = new Map<number, T[]>();
  for (const load of loads) {
    const list = byNumber.get(load.loadNumber) ?? [];
    list.push(load);
    byNumber.set(load.loadNumber, list);
  }
  return Array.from(byNumber, ([loadNumber, list]) => {
    const sorted = [...list].sort(
      (a, b) => a.variantLetter.localeCompare(b.variantLetter) || time(a.createdAt) - time(b.createdAt)
    );
    const counts = sorted.map((l) => l.caseLoadCount).filter((c): c is number => c != null);
    return {
      loadNumber,
      date: new Date(Math.min(...sorted.map((l) => time(l.createdAt)))),
      loadCount: counts.length ? Math.max(...counts) : null,
      loads: sorted,
    };
  }).sort(compareCycles);
}

/** Load count is the most reliable order (dates can be day-only or entered
 *  late); fall back to date, then load number. */
function compareCycles(a: LotCycle<LotLoad>, b: LotCycle<LotLoad>): number {
  if (a.loadCount != null && b.loadCount != null && a.loadCount !== b.loadCount) return a.loadCount - b.loadCount;
  return a.date.getTime() - b.date.getTime() || a.loadNumber - b.loadNumber;
}

/** Load count to suggest when a load with `loadNumber` uses this lot: the same
 *  count as its sibling variants if they're already in the lot, otherwise one
 *  more than the lot's previous cycles. */
export function suggestCaseLoadCount(lotLoads: readonly LotLoad[], loadNumber: number | null | undefined): number {
  const cycles = caseLotCycles(lotLoads);
  const own = cycles.find((c) => c.loadNumber === loadNumber);
  if (own?.loadCount != null) return own.loadCount;
  const others = cycles.filter((c) => c.loadNumber !== loadNumber);
  const counts = others.map((c) => c.loadCount).filter((c): c is number => c != null);
  return Math.max(others.length, ...counts) + 1;
}
