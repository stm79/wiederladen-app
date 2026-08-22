import { prisma } from "@/lib/prisma";
import { csvResponse } from "@/lib/csv-response";

export async function GET() {
  const groups = await prisma.shotGroup.findMany({
    include: { session: true, load: true },
    orderBy: { createdAt: "desc" },
  });

  const rows = groups.map((g) => ({
    id: g.id,
    datum: g.session.date.toISOString().slice(0, 10),
    ladung: g.load?.name ?? g.load?.powder ?? "",
    distanzM: g.distanceM ?? "",
    extremeSpreadMm: g.extremeSpreadMm ?? "",
    meanRadiusMm: g.meanRadiusMm ?? "",
    anzahlSchuss: g.shotCount ?? "",
    quelle: g.source,
    notizen: g.notes ?? "",
  }));

  return csvResponse(rows, "schussgruppen.csv");
}
