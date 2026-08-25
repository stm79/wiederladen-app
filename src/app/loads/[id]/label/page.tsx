import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatLoadNumber } from "@/lib/loads/variant-letter";
import { labelNumber, labelPowder } from "@/lib/label-format";
import { PrintButton } from "@/components/ui/PrintButton";

// Dymo LabelWriter 450, 36 x 89mm label stock.
const LABEL_WIDTH_MM = 89;
const LABEL_HEIGHT_MM = 36;

export default async function LoadLabelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const load = await prisma.load.findUnique({ where: { id }, include: { firearm: true } });

  if (!load) notFound();

  const bulletWeight = load.bulletWeightGr != null ? `${labelNumber(load.bulletWeightGr, 0)}gn ` : "";

  return (
    <div className="flex flex-col items-center gap-4">
      <style>{`
        @page { size: ${LABEL_WIDTH_MM}mm ${LABEL_HEIGHT_MM}mm; margin: 0; }
        @media print { body { margin: 0; } }
      `}</style>

      <div className="flex w-full max-w-md items-center justify-between print:hidden">
        <Link href={`/loads/${load.id}`} className="text-sm text-neutral-500 underline">
          Zurück zur Ladung
        </Link>
        <PrintButton />
      </div>

      <div
        className="flex flex-col justify-between border border-neutral-300 bg-white text-black"
        style={{
          width: `${LABEL_WIDTH_MM}mm`,
          height: `${LABEL_HEIGHT_MM}mm`,
          boxSizing: "border-box",
          // Dymo LabelWriter (30321 Large Address, 36x89mm) has a physically
          // unprintable strip at the top and right edges that print preview
          // doesn't show — confirmed via test prints, top row and rightmost
          // characters were getting cut off. Extra padding on those two sides
          // compensates; font/line-height trimmed slightly so 5 rows still fit.
          padding: "7mm 6mm 1.5mm 2.5mm",
          fontSize: "13pt",
          lineHeight: 1.12,
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div className="flex justify-between gap-2 font-bold">
          {/* Waffe (the name alone) sits in the truncating flex-1 slot — if
              anything has to get cut off by the ellipsis it should be the
              name, not the caliber, which is the safety-critical bit and so
              lives in its own never-truncated shrink-0 slot like No:. */}
          <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
            Waffe: {load.firearm.name}
          </span>
          <span className="shrink-0 whitespace-nowrap">{load.firearm.caliber}</span>
          <span className="shrink-0 whitespace-nowrap">
            No: {formatLoadNumber(load.loadNumber, load.variantLetter)}
          </span>
        </div>
        <div className="overflow-hidden text-ellipsis whitespace-nowrap">
          Geschoss: {bulletWeight}
          {load.bullet ?? "–"}
        </div>
        <div className="flex justify-between gap-2">
          <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
            Pulver: {labelPowder(load.powder)}
          </span>
          <span className="shrink-0 whitespace-nowrap">Ladung: {labelNumber(load.chargeGrains, 2)} gn</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
            Zünder: {load.primer ?? "–"}
          </span>
          <span className="shrink-0 whitespace-nowrap">
            COAL: {load.oalMm != null ? `${labelNumber(load.oalMm, 2)}mm` : "–"}
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
            Hülsen: {load.caseBrand ?? "–"}
          </span>
          <span className="shrink-0 whitespace-nowrap">Count: {load.caseLoadCount ?? "–"}</span>
        </div>
      </div>

      <p className="max-w-md text-center text-xs text-neutral-400 print:hidden">
        Drucken öffnet den normalen Browser-Druckdialog — dort den Dymo LabelWriter 450 als Drucker
        auswählen. Falls das Etikett nicht die ganze Fläche füllt: im Druckdialog{" "}
        <strong>Papierformat</strong> auf die 36×89mm-Etikettengröße stellen (nicht „Letter“/„A4“),{" "}
        <strong>Ränder</strong> auf „Keine“ und <strong>Skalierung</strong> auf{" "}
        <strong>100% / Tatsächliche Größe</strong> — nicht „An Seite anpassen“.
      </p>
    </div>
  );
}
