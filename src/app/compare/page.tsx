import { prisma } from "@/lib/prisma";
import { buildComparisonRow } from "@/lib/comparison/aggregate";
import { CompareView } from "@/components/compare/CompareView";

// Aggregates data from loads, velocity sets, and shot groups — none of those
// mutations revalidate this route, so always render fresh.
export const dynamic = "force-dynamic";

export default async function ComparePage() {
  const loads = await prisma.load.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      firearm: true,
      shotGroups: { include: { velocitySets: { include: { shots: true } } } },
    },
  });

  const rows = loads.map((load) =>
    buildComparisonRow({
      id: load.id,
      name: load.name,
      firearmId: load.firearmId,
      firearmName: load.firearm.name,
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

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Vergleich</h1>
      {rows.length === 0 ? (
        <p className="text-sm text-neutral-500">Noch keine Ladedaten zum Vergleichen vorhanden.</p>
      ) : (
        <CompareView rows={rows} />
      )}
    </div>
  );
}
