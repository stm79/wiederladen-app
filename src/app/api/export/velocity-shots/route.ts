import { prisma } from "@/lib/prisma";
import { csvResponse } from "@/lib/csv-response";

export async function GET() {
  const shots = await prisma.velocityShot.findMany({
    include: {
      velocitySet: { include: { group: { include: { session: true, load: true } } } },
    },
    orderBy: [{ velocitySetId: "asc" }, { shotNumber: "asc" }],
  });

  const rows = shots.map((s) => ({
    id: s.id,
    datum: s.velocitySet.group.session.date.toISOString().slice(0, 10),
    ladung: s.velocitySet.group.load?.name ?? s.velocitySet.group.load?.powder ?? "",
    quelle: s.velocitySet.sourceDevice,
    schussNr: s.shotNumber,
    geschwindigkeitMps: s.velocityMps,
  }));

  return csvResponse(rows, "geschwindigkeitsmessungen.csv");
}
