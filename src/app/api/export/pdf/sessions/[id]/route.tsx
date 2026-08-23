import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUnitPreferences } from "@/lib/settings";
import { SessionReportDocument } from "@/lib/pdf/session-report";
import { loadDisplayName } from "@/lib/loads/label";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      firearm: true,
      sessionLoads: { include: { load: { include: { firearm: { select: { caliber: true } } } } } },
      groups: {
        include: {
          load: { include: { firearm: { select: { caliber: true } } } },
          velocitySets: { include: { shots: true } },
        },
      },
    },
  });

  if (!session) {
    return NextResponse.json({ error: "Session nicht gefunden" }, { status: 404 });
  }

  const loadLabel = (
    load: { name: string | null; bulletWeightGr: number | null; bullet: string | null; firearm: { caliber: string } } | null
  ) => (load ? loadDisplayName({ ...load, caliber: load.firearm.caliber }) : "—");

  const prefs = await getUnitPreferences();

  const buffer = await renderToBuffer(
    <SessionReportDocument
      session={{
        date: session.date,
        location: session.location,
        firearmName: session.firearm?.name ?? null,
        tempC: session.tempC,
        pressureHPa: session.pressureHPa,
        humidityPct: session.humidityPct,
        notes: session.notes,
        loadLabels: session.sessionLoads.map((sl) => loadLabel(sl.load)),
        groups: session.groups.map((g) => ({
          loadLabel: loadLabel(g.load),
          distanceM: g.distanceM,
          extremeSpreadMm: g.extremeSpreadMm,
          meanRadiusMm: g.meanRadiusMm,
          shotCount: g.shotCount,
          source: g.source,
        })),
        velocitySets: session.groups.flatMap((g) =>
          g.velocitySets.map((v) => ({
            loadLabel: loadLabel(g.load),
            sourceDevice: v.sourceDevice,
            avgMps: v.avgMps,
            sdMps: v.sdMps,
            esMps: v.esMps,
            shotCount: v.shots.length,
          }))
        ),
      }}
      prefs={prefs}
    />
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="session-${session.id}.pdf"`,
    },
  });
}
