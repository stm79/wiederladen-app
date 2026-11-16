import { prisma } from "@/lib/prisma";
import { csvResponse } from "@/lib/csv-response";
import { formatLoadNumber } from "@/lib/loads/variant-letter";
import { caseLotLabel } from "@/lib/case-lots/history";

export async function GET() {
  const loads = await prisma.load.findMany({
    include: { firearm: true, caseLot: true },
    orderBy: { createdAt: "desc" },
  });

  const rows = loads.map((l) => ({
    id: l.id,
    ladungsnummer: formatLoadNumber(l.loadNumber, l.variantLetter),
    name: l.name ?? "",
    waffe: l.firearm.name,
    kaliber: l.firearm.caliber,
    zuendhuetchen: l.primer ?? "",
    pulver: l.powder ?? "",
    ladungsmengeGrain: l.chargeGrains,
    geschoss: l.bullet ?? "",
    geschossgewichtGrain: l.bulletWeightGr ?? "",
    oalMm: l.oalMm ?? "",
    cbtoMm: l.cbtoMm ?? "",
    huelseCharge: l.caseLot ? caseLotLabel(l.caseLot) : "",
    huelseMarke: l.caseBrand ?? "",
    huelseAnzahl: l.caseQuantity ?? "",
    huelseLoadCount: l.caseLoadCount ?? "",
    huelseTrimmlaengeMm: l.caseTrimLengthMm ?? "",
    matrize: l.sizingDie ?? "",
    shoulderBumpMm: l.shoulderBumpMm ?? "",
    bushingDurchmesserMm: l.bushingDiameterMm ?? "",
    mandrelDurchmesserMm: l.mandrelDiameterMm ?? "",
    setzmatrize: l.seatingDie ?? "",
    crimp: l.crimpInfo ?? "",
    notizen: l.notes ?? "",
    angelegtAm: l.createdAt.toISOString(),
  }));

  return csvResponse(rows, "ladedaten.csv");
}
