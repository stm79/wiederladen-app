import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FirearmForm } from "@/components/forms/FirearmForm";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { LinkButton } from "@/components/ui/Button";
import { Card, EmptyState, ListCard, ListRow, LoadNumberBadge, PageHeader, Section } from "@/components/ui/Layout";
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

  const specs = [firearm.caliber, firearm.twistRate ? `Drall ${firearm.twistRate}` : null].filter(Boolean);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        back={{ href: "/firearms", label: "Waffen" }}
        title={firearm.name}
        subtitle={
          <span className="flex flex-wrap gap-x-1">
            {specs.join(" · ")}
            {firearm.barrelLenMm != null && (
              <span>
                · Lauf <UnitValueDisplay kind="length" value={firearm.barrelLenMm} fractionDigits={0} />
              </span>
            )}
          </span>
        }
        actions={
          <>
            <LinkButton href={`/loads/new?firearmId=${firearm.id}`} icon="plus">
              Neue Ladung
            </LinkButton>
            <DeleteButton
              id={firearm.id}
              action={deleteFirearm}
              redirectTo="/firearms"
              confirmMessage={`"${firearm.name}" wirklich löschen? Zugehörige Ladedaten werden ebenfalls gelöscht.`}
            />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
        <div className="flex min-w-0 flex-col gap-8">
          <Section title="Ladedaten">
            {firearm.loads.length === 0 ? (
              <EmptyState
                icon="flask"
                title="Noch keine Ladedaten für diese Waffe"
                action={
                  <LinkButton href={`/loads/new?firearmId=${firearm.id}`} variant="secondary" icon="plus">
                    Neue Ladung
                  </LinkButton>
                }
              />
            ) : (
              <ListCard>
                {firearm.loads.map((load) => (
                  <ListRow key={load.id} href={`/loads/${load.id}`}>
                    <LoadNumberBadge>{formatLoadNumber(load.loadNumber, load.variantLetter)}</LoadNumberBadge>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">
                        {loadDisplayName({
                          name: load.name,
                          caliber: firearm.caliber,
                          bulletWeightGr: load.bulletWeightGr,
                          bullet: load.bullet,
                        })}
                      </div>
                      {load.powder && (
                        <div className="truncate text-sm text-neutral-500 dark:text-neutral-400">{load.powder}</div>
                      )}
                    </div>
                    <span className="shrink-0 text-sm font-medium tabular-nums">
                      <UnitValueDisplay kind="weight" value={load.chargeGrains} />
                    </span>
                  </ListRow>
                ))}
              </ListCard>
            )}
          </Section>

          {ladderPoints.length > 0 && (
            <Section title="Geschwindigkeit vs. Ladungsmenge">
              <Card>
                <LadderChart points={ladderPoints} />
              </Card>
            </Section>
          )}
        </div>

        <Section title="Daten bearbeiten">
          <FirearmForm firearm={firearm} knownCalibers={knownCalibers} />
        </Section>
      </div>
    </div>
  );
}
