import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FirearmForm } from "@/components/forms/FirearmForm";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { UnitValueDisplay } from "@/components/units/UnitValueDisplay";
import { LadderChart } from "@/components/charts/LadderChart";
import { deleteFirearm } from "@/app/actions/firearms";
import { formatLoadNumber } from "@/lib/loads/variant-letter";
import { loadDisplayName } from "@/lib/loads/label";
import { getKnownCalibers } from "@/lib/firearms/distinct-values";

export default async function FirearmDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [firearm, knownCalibers] = await Promise.all([
    prisma.firearm.findUnique({
      where: { id },
      include: {
        loads: { orderBy: { createdAt: "desc" }, include: { shotGroups: { include: { velocitySets: true } } } },
      },
    }),
    getKnownCalibers(),
  ]);

  if (!firearm) notFound();

  // Group by powder (brand+type), not by individual load row: a ladder test is
  // "same everything but charge weight", so every charge step of the same
  // propellant belongs to one series — grouping by load id would fragment a
  // single ladder into one color per step.
  const ladderPoints = firearm.loads.flatMap((load) => {
    const powderLabel = load.powder || "Unbekanntes Pulver";
    return load.shotGroups
      .flatMap((g) => g.velocitySets)
      .filter((vs) => vs.avgMps != null)
      .map((vs) => ({
        seriesKey: powderLabel,
        seriesLabel: powderLabel,
        chargeGrains: load.chargeGrains,
        velocityMps: vs.avgMps!,
      }));
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:justify-between">
        <div className="max-w-lg flex-1">
          <h1 className="mb-4 text-xl font-semibold">Waffe bearbeiten</h1>
          <FirearmForm firearm={firearm} knownCalibers={knownCalibers} />
        </div>
        <div className="shrink-0">
          <DeleteButton
            id={firearm.id}
            action={deleteFirearm}
            redirectTo="/firearms"
            confirmMessage={`"${firearm.name}" wirklich löschen? Zugehörige Ladedaten werden ebenfalls gelöscht.`}
          />
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Ladedaten für diese Waffe</h2>
          <Link href={`/loads/new?firearmId=${firearm.id}`} className="text-sm text-neutral-500 underline">
            + Neue Ladung
          </Link>
        </div>
        {firearm.loads.length === 0 ? (
          <p className="text-sm text-neutral-500">Noch keine Ladedaten für diese Waffe.</p>
        ) : (
          <div className="flex flex-col divide-y divide-neutral-200 dark:divide-neutral-800">
            {firearm.loads.map((load) => (
              <Link
                key={load.id}
                href={`/loads/${load.id}`}
                className="flex items-center justify-between py-3 hover:bg-neutral-50 dark:hover:bg-neutral-900"
              >
                <div>
                  <div className="font-medium">
                    <span className="mr-2 text-neutral-400 tabular-nums">
                      {formatLoadNumber(load.loadNumber, load.variantLetter)}
                    </span>
                    {loadDisplayName({
                      name: load.name,
                      caliber: firearm.caliber,
                      bulletWeightGr: load.bulletWeightGr,
                      bullet: load.bullet,
                    })}
                  </div>
                  <div className="text-sm text-neutral-500">
                    {load.bulletWeightGr ? load.bullet : null}
                  </div>
                </div>
                <UnitValueDisplay kind="weight" value={load.chargeGrains} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {ladderPoints.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Geschwindigkeit vs. Ladungsmenge</h2>
          <LadderChart points={ladderPoints} />
        </div>
      )}
    </div>
  );
}
