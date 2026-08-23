import { prisma } from "@/lib/prisma";
import { csvResponse } from "@/lib/csv-response";
import { loadDisplayName } from "@/lib/loads/label";

export async function GET() {
  const shots = await prisma.velocityShot.findMany({
    include: {
      velocitySet: {
        include: {
          group: {
            include: { session: true, load: { include: { firearm: { select: { caliber: true } } } } },
          },
        },
      },
    },
    orderBy: [{ velocitySetId: "asc" }, { shotNumber: "asc" }],
  });

  const rows = shots.map((s) => ({
    id: s.id,
    datum: s.velocitySet.group.session.date.toISOString().slice(0, 10),
    ladung: s.velocitySet.group.load
      ? loadDisplayName({ ...s.velocitySet.group.load, caliber: s.velocitySet.group.load.firearm.caliber })
      : "",
    quelle: s.velocitySet.sourceDevice,
    schussNr: s.shotNumber,
    geschwindigkeitMps: s.velocityMps,
  }));

  return csvResponse(rows, "geschwindigkeitsmessungen.csv");
}
