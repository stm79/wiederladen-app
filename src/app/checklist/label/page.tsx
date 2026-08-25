import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PrintButton } from "@/components/ui/PrintButton";

// Same Dymo LabelWriter 30321 Large Address stock as the load label, just
// rotated to portrait — printed once, filled in by hand per batch, so it's
// the step template only (no per-load checked state).
const LABEL_WIDTH_MM = 36;
const LABEL_HEIGHT_MM = 89;

export const dynamic = "force-dynamic";

export default async function ChecklistLabelPage() {
  const steps = await prisma.checklistStep.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="flex flex-col items-center gap-4">
      <style>{`
        @page { size: ${LABEL_WIDTH_MM}mm ${LABEL_HEIGHT_MM}mm; margin: 0; }
        @media print { body { margin: 0; } }
      `}</style>

      <div className="flex w-full max-w-md items-center justify-between print:hidden">
        <Link href="/settings" className="text-sm text-neutral-500 underline">
          Zurück zu den Einstellungen
        </Link>
        <PrintButton />
      </div>

      {steps.length === 0 ? (
        <p className="text-sm text-neutral-500 print:hidden">
          Noch keine Checkliste-Schritte angelegt — unter Einstellungen → Wiederlade-Checkliste anlegen.
        </p>
      ) : (
        <div
          className="flex flex-col gap-1.5 border border-neutral-300 bg-white text-black"
          style={{
            width: `${LABEL_WIDTH_MM}mm`,
            height: `${LABEL_HEIGHT_MM}mm`,
            boxSizing: "border-box",
            // Same unprintable-edge margin as the load label (top/right),
            // rotated for portrait — re-check on a real print and adjust.
            padding: "6mm 1.5mm 2.5mm 7mm",
            fontSize: "9pt",
            lineHeight: 1.15,
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          <div className="mb-1 text-[10pt] font-bold">Wiederlade-Checkliste</div>
          {steps.map((step) => (
            <div key={step.id} className="flex items-start gap-1.5">
              <span
                aria-hidden="true"
                className="mt-[1px] block shrink-0 border border-black"
                style={{ width: "3mm", height: "3mm" }}
              />
              <span>{step.label}</span>
            </div>
          ))}
        </div>
      )}

      <p className="max-w-md text-center text-xs text-neutral-400 print:hidden">
        Druckt im Hochkantformat auf dieselbe 36×89mm-Etikettenrolle wie das Ladungs-Etikett — im
        Druckdialog <strong>Papierformat</strong> auf die 36×89mm-Etikettengröße stellen,{" "}
        <strong>Ränder</strong> auf „Keine“ und <strong>Skalierung</strong> auf{" "}
        <strong>100% / Tatsächliche Größe</strong>. Passt eine lange Liste nicht auf ein Etikett, hier
        Bescheid geben, dann wird die Schrift weiter verkleinert.
      </p>
    </div>
  );
}
