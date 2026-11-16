import { prisma } from "@/lib/prisma";

/** Every case lot with the loads that used it — what the load form needs for
 *  the lot picker, the load-count suggestion and the history preview. */
export async function getCaseLotOptions() {
  const lots = await prisma.caseLot.findMany({
    orderBy: { number: "desc" },
    include: {
      loads: {
        select: { id: true, loadNumber: true, variantLetter: true, caseLoadCount: true, createdAt: true },
      },
    },
  });
  return lots.map((lot) => ({
    id: lot.id,
    number: lot.number,
    name: lot.name,
    brand: lot.brand,
    caliber: lot.caliber,
    quantity: lot.quantity,
    retired: lot.retired,
    loads: lot.loads,
  }));
}

export type CaseLotOption = Awaited<ReturnType<typeof getCaseLotOptions>>[number];
