import { prisma } from "@/lib/prisma";

/** Distinct, previously-used values for the combobox-with-history fields on
 *  the load form (powder, bullet, primer) — lets the user pick a value
 *  they've used before or type a new one. */
export async function getDistinctLoadFieldValues() {
  const [powders, bullets, primers] = await Promise.all([
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
  ]);

  return {
    powders: powders.map((p) => p.powder!),
    bullets: bullets.map((b) => b.bullet!),
    primers: primers.map((p) => p.primer!),
  };
}
