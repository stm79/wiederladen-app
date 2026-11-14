import { prisma } from "@/lib/prisma";
import { buildComparisonRow } from "@/lib/comparison/aggregate";
import { buildLoadSessionBreakdown } from "@/lib/comparison/session-breakdown";
import { CompareView } from "@/components/compare/CompareView";
import { LoadSessionCompare } from "@/components/compare/LoadSessionCompare";
import { EmptyState, PageHeader, Section } from "@/components/ui/Layout";

// Aggregates data from loads, velocity sets, and shot groups — none of those
// mutations revalidate this route, so always render fresh.
export const dynamic = "force-dynamic";

export default async function ComparePage() {
  const loads = await prisma.load.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      firearm: true,
      shotGroups: {
        include: {
          velocitySets: { include: { shots: true } },
          session: { select: { date: true, location: true, tempC: true, pressureHPa: true, humidityPct: true } },
        },
      },
    },
  });

  const rows = loads.map((load) =>
    buildComparisonRow({
      id: load.id,
      name: load.name,
      loadNumber: load.loadNumber,
      variantLetter: load.variantLetter,
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
      extremeSpreadsMm: load.shotGroups
        .map((g) => g.extremeSpreadMm)
        .filter((v): v is number => v != null),
    })
  );

  const sessionsByLoad = Object.fromEntries(
    loads.map((load) => [
      load.id,
      buildLoadSessionBreakdown(
        load.shotGroups.map((g) => ({
          sessionId: g.sessionId,
          sessionDate: g.session.date,
          sessionLocation: g.session.location,
          tempC: g.session.tempC,
          pressureHPa: g.session.pressureHPa,
          humidityPct: g.session.humidityPct,
          extremeSpreadMm: g.extremeSpreadMm,
          velocitiesMps: g.velocitySets.flatMap((vs) => vs.shots.map((s) => s.velocityMps)),
        }))
      ),
    ])
  );

  return (
    <div className="flex flex-col gap-10">
      <PageHeader title="Vergleich" subtitle="Ladungen nebeneinander auswerten — Geschwindigkeit, Streuung, Gruppengröße." />

      <Section title="Ladungen vergleichen">
        {rows.length === 0 ? (
          <EmptyState icon="chart" title="Noch keine Ladedaten zum Vergleichen vorhanden" />
        ) : (
          <CompareView rows={rows} />
        )}
      </Section>

      <Section
        title="Eine Ladung über mehrere Sessions"
        description="Dieselbe Ladung Session für Session — z.B. um zu sehen, wie stark unterschiedliche Temperaturen die Geschwindigkeit verändert haben."
      >
        <LoadSessionCompare loadOptions={rows.map((r) => ({ loadId: r.loadId, loadLabel: r.loadLabel }))} sessionsByLoad={sessionsByLoad} />
      </Section>
    </div>
  );
}
