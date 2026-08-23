import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUnitPreferences } from "@/lib/settings";
import { buildComparisonRow } from "@/lib/comparison/aggregate";
import { LoadReportDocument } from "@/lib/pdf/load-report";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const load = await prisma.load.findUnique({
    where: { id },
    include: {
      firearm: true,
      shotGroups: { include: { velocitySets: { include: { shots: true } } } },
    },
  });

  if (!load) {
    return NextResponse.json({ error: "Ladung nicht gefunden" }, { status: 404 });
  }

  const prefs = await getUnitPreferences();
  const aggregate = buildComparisonRow({
    id: load.id,
    name: load.name,
    firearmId: load.firearmId,
    firearmName: load.firearm.name,
    caliber: load.firearm.caliber,
    powder: load.powder,
    chargeGrains: load.chargeGrains,
    bullet: load.bullet,
    bulletWeightGr: load.bulletWeightGr,
    oalMm: load.oalMm,
    velocitiesMps: load.shotGroups.flatMap((g) =>
      g.velocitySets.flatMap((vs) => vs.shots.map((s) => s.velocityMps))
    ),
    extremeSpreadsMm: load.shotGroups.map((g) => g.extremeSpreadMm).filter((v): v is number => v != null),
  });

  const buffer = await renderToBuffer(
    <LoadReportDocument
      load={{
        loadNumber: load.loadNumber,
        variantLetter: load.variantLetter,
        name: load.name,
        firearmName: load.firearm.name,
        caliber: load.firearm.caliber,
        primer: load.primer,
        powder: load.powder,
        chargeGrains: load.chargeGrains,
        bullet: load.bullet,
        bulletWeightGr: load.bulletWeightGr,
        oalMm: load.oalMm,
        cbtoMm: load.cbtoMm,
        caseBrand: load.caseBrand,
        caseQuantity: load.caseQuantity,
        caseLoadCount: load.caseLoadCount,
        caseTrimLengthMm: load.caseTrimLengthMm,
        sizingDie: load.sizingDie,
        shoulderBumpMm: load.shoulderBumpMm,
        bushingDiameterMm: load.bushingDiameterMm,
        mandrelDiameterMm: load.mandrelDiameterMm,
        crimpInfo: load.crimpInfo,
        notes: load.notes,
        avgMps: aggregate.avgMps,
        sdMps: aggregate.sdMps,
        esMps: aggregate.esMps,
        shotCount: aggregate.shotCount,
        meanExtremeSpreadMm: aggregate.meanExtremeSpreadMm,
        groupCount: aggregate.groupCount,
      }}
      prefs={prefs}
    />
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="ladung-${load.id}.pdf"`,
    },
  });
}
