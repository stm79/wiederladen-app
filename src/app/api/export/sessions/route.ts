import { prisma } from "@/lib/prisma";
import { csvResponse } from "@/lib/csv-response";

export async function GET() {
  const sessions = await prisma.session.findMany({
    include: { firearm: true },
    orderBy: { date: "desc" },
  });

  const rows = sessions.map((s) => ({
    id: s.id,
    datum: s.date.toISOString().slice(0, 10),
    ort: s.location ?? "",
    waffe: s.firearm?.name ?? "",
    distanzM: s.distanceM ?? "",
    temperaturC: s.tempC ?? "",
    luftdruckHPa: s.pressureHPa ?? "",
    luftfeuchtigkeitPct: s.humidityPct ?? "",
    notizen: s.notes ?? "",
  }));

  return csvResponse(rows, "sessions.csv");
}
