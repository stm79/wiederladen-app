import { prisma } from "@/lib/prisma";
import { POWDER_CATALOG } from "@/lib/loads/powder-catalog";
import { BULLET_CATALOG } from "@/lib/loads/bullet-catalog";

/** Distinct, previously-used values for the combobox-with-history fields on
 *  the load form (powder, bullet, primer, dies) — lets the user pick a value
 *  they've used before or type a new one. */
export async function getDistinctLoadFieldValues() {
  const [powders, bullets, primers, sizingDies, seatingDies] = await Promise.all([
    prisma.load.findMany({
      where: { powder: { not: null } },
      distinct: ["powder"],
      select: { powder: true },
      orderBy: { powder: "asc" },
    }),
    prisma.load.findMany({
      where: { bullet: { not: null } },
      distinct: ["bullet"],
      select: { bullet: true },
      orderBy: { bullet: "asc" },
    }),
    prisma.load.findMany({
      where: { primer: { not: null } },
      distinct: ["primer"],
      select: { primer: true },
      orderBy: { primer: "asc" },
    }),
    prisma.load.findMany({
      where: { sizingDie: { not: null } },
      distinct: ["sizingDie"],
      select: { sizingDie: true },
      orderBy: { sizingDie: "asc" },
    }),
    prisma.load.findMany({
      where: { seatingDie: { not: null } },
      distinct: ["seatingDie"],
      select: { seatingDie: true },
      orderBy: { seatingDie: "asc" },
    }),
  ]);

  const usedPowders = powders.map((p) => p.powder!);
  const allPowders = Array.from(new Set([...POWDER_CATALOG, ...usedPowders])).sort((a, b) => a.localeCompare(b));

  const usedBullets = bullets.map((b) => b.bullet!);
  const allBullets = Array.from(new Set([...BULLET_CATALOG, ...usedBullets])).sort((a, b) => a.localeCompare(b));

  return {
    powders: allPowders,
    bullets: allBullets,
    primers: primers.map((p) => p.primer!),
    sizingDies: sizingDies.map((d) => d.sizingDie!),
    seatingDies: seatingDies.map((d) => d.seatingDie!),
  };
}
