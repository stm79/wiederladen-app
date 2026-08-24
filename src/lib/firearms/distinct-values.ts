import { prisma } from "@/lib/prisma";
import { CALIBER_CATALOG } from "@/lib/firearms/caliber-catalog";

/** Distinct calibers for the firearm form's combobox-with-history field —
 *  the static catalog plus whatever's already been typed into existing
 *  firearms, deduped. */
export async function getKnownCalibers(): Promise<string[]> {
  const firearms = await prisma.firearm.findMany({
    distinct: ["caliber"],
    select: { caliber: true },
  });
  const usedCalibers = firearms.map((f) => f.caliber);
  return Array.from(new Set([...CALIBER_CATALOG, ...usedCalibers])).sort((a, b) => a.localeCompare(b));
}
