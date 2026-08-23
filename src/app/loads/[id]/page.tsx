import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LoadForm } from "@/components/forms/LoadForm";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { DuplicateButton } from "@/components/ui/DuplicateButton";
import { Button } from "@/components/ui/Button";
import { UnitValueDisplay } from "@/components/units/UnitValueDisplay";
import { LoadChecklist } from "@/components/loads/LoadChecklist";
import { deleteLoad } from "@/app/actions/loads";
import { getDistinctLoadFieldValues } from "@/lib/loads/distinct-values";
import { formatLoadNumber } from "@/lib/loads/variant-letter";
import { loadDisplayName } from "@/lib/loads/label";

export default async function LoadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [load, firearms, known, checklistSteps] = await Promise.all([
    prisma.load.findUnique({
      where: { id },
      include: {
        parentLoad: { include: { firearm: { select: { caliber: true } } } },
        variants: { orderBy: { createdAt: "desc" }, include: { firearm: { select: { caliber: true } } } },
        shotGroups: { include: { session: true }, orderBy: { createdAt: "desc" } },
        checklistChecks: true,
      },
    }),
    prisma.firearm.findMany({ orderBy: { name: "asc" } }),
    getDistinctLoadFieldValues(),
    prisma.checklistStep.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  if (!load) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:justify-between">
        <div className="max-w-2xl flex-1">
          <h1 className="mb-1 text-xl font-semibold">Ladung bearbeiten</h1>
          {load.parentLoad && (
            <p className="mb-4 text-sm text-neutral-500">
              Variante von{" "}
              <Link href={`/loads/${load.parentLoad.id}`} className="underline">
                {loadDisplayName({ ...load.parentLoad, caliber: load.parentLoad.firearm.caliber })}
              </Link>
            </p>
          )}
          <LoadForm
            firearms={firearms}
            load={load}
            knownPowders={known.powders}
            knownBullets={known.bullets}
            knownPrimers={known.primers}
          />
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <a href={`/api/export/pdf/loads/${load.id}`} className="text-center">
            <Button type="button" variant="secondary" className="w-full">
              PDF-Bericht
            </Button>
          </a>
          <Link href={`/loads/${load.id}/label`} className="text-center">
            <Button type="button" variant="secondary" className="w-full">
              Dymo-Label
            </Button>
          </Link>
          <DuplicateButton id={load.id} />
          <DeleteButton
            id={load.id}
            action={deleteLoad}
            redirectTo="/loads"
            confirmMessage="Diese Ladung wirklich löschen?"
          />
        </div>
      </div>

      <LoadChecklist
        loadId={load.id}
        steps={checklistSteps}
        checkedStepIds={load.checklistChecks.map((c) => c.stepId)}
      />

      {load.shotGroups.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Schussgruppen mit dieser Ladung</h2>
          <div className="flex flex-col divide-y divide-neutral-200 dark:divide-neutral-800">
            {load.shotGroups.map((group) => (
              <Link
                key={group.id}
                href={`/sessions/${group.sessionId}`}
                className="flex items-center justify-between py-2 hover:bg-neutral-50 dark:hover:bg-neutral-900"
              >
                <div>
                  <div className="font-medium">
                    {new Intl.DateTimeFormat("de-DE").format(group.session.date)}
                    {group.session.location ? ` – ${group.session.location}` : ""}
                  </div>
                  <div className="text-sm text-neutral-500">
                    {group.distanceM ? `${group.distanceM} m · ` : ""}
                    {group.shotCount ? `${group.shotCount} Schuss` : ""}
                  </div>
                </div>
                <UnitValueDisplay kind="length" value={group.extremeSpreadMm} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {load.variants.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Varianten dieser Ladung</h2>
          <div className="flex flex-col divide-y divide-neutral-200 dark:divide-neutral-800">
            {load.variants.map((variant) => (
              <Link
                key={variant.id}
                href={`/loads/${variant.id}`}
                className="py-2 hover:bg-neutral-50 dark:hover:bg-neutral-900"
              >
                <span className="mr-2 text-neutral-400 tabular-nums">
                  {formatLoadNumber(variant.loadNumber, variant.variantLetter)}
                </span>
                {loadDisplayName({ ...variant, caliber: variant.firearm.caliber })}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
