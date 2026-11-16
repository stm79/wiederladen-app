import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CaseLotForm } from "@/components/forms/CaseLotForm";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { LinkButton } from "@/components/ui/Button";
import { Badge, Card, EmptyState, LoadNumberBadge, PageHeader, Section, Stat } from "@/components/ui/Layout";
import { UnitValueDisplay } from "@/components/units/UnitValueDisplay";
import { deleteCaseLot } from "@/app/actions/case-lots";
import { caseLotCycles, formatCaseLotNumber } from "@/lib/case-lots/history";
import { formatLoadNumber } from "@/lib/loads/variant-letter";
import { formatDate } from "@/lib/format-date";
import { getKnownCalibers } from "@/lib/firearms/distinct-values";

export const dynamic = "force-dynamic";

export default async function CaseLotDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [lot, knownCalibers] = await Promise.all([
    prisma.caseLot.findUnique({
      where: { id },
      include: {
        loads: {
          include: {
            firearm: { select: { name: true } },
            shotGroups: { include: { velocitySets: { select: { sdMps: true } } } },
          },
        },
      },
    }),
    getKnownCalibers(),
  ]);

  if (!lot) notFound();

  const cycles = caseLotCycles(lot.loads);
  const currentCount = cycles.at(-1)?.loadCount ?? cycles.length;
  const firearmNames = Array.from(new Set(lot.loads.map((l) => l.firearm.name)));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        back={{ href: "/cases", label: "Hülsen" }}
        badge={
          <span className="inline-flex items-center rounded-md bg-brand-soft px-2 py-1 font-mono text-sm font-semibold text-brand-strong">
            {formatCaseLotNumber(lot.number)}
          </span>
        }
        title={lot.name}
        subtitle={
          <span className="flex flex-wrap items-center gap-x-1.5">
            {[lot.brand, lot.caliber].filter(Boolean).join(" · ") || "Hülsen-Charge"}
            {lot.retired && <Badge>ausgemustert</Badge>}
          </span>
        }
        actions={
          <>
            <LinkButton href="/loads/new" variant="secondary" icon="plus">
              Neue Ladung
            </LinkButton>
            <DeleteButton
              id={lot.id}
              action={deleteCaseLot}
              redirectTo="/cases"
              confirmMessage={`Charge ${formatCaseLotNumber(lot.number)} wirklich löschen? Die Ladungen bleiben erhalten, verlieren aber die Zuordnung.`}
            />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
        <div className="flex min-w-0 flex-col gap-8">
          <Card>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat label="Stück">{lot.quantity ?? "—"}</Stat>
              <Stat label="Geladen">{cycles.length ? `${currentCount}×` : "—"}</Stat>
              <Stat label="Gekauft">{lot.purchasedAt ? formatDate(lot.purchasedAt) : "—"}</Stat>
              <Stat label="Waffe">
                <span className="block truncate text-sm">{firearmNames.join(", ") || "—"}</span>
              </Stat>
            </div>
          </Card>

          <Section title="Verlauf" description="Jeder Ladezyklus dieser Hülsen, vom ersten bis zum letzten.">
            {cycles.length === 0 ? (
              <EmptyState
                icon="cartridge"
                title="Noch keiner Ladung zugeordnet"
                description="Wähle diese Charge in einer Ladung im Tab „Hülse“ aus."
              />
            ) : (
              <ol className="relative flex flex-col gap-3 border-l-2 border-neutral-200 pl-5 dark:border-neutral-800">
                {cycles.map((cycle, i) => {
                  const groups = cycle.loads.flatMap((l) => l.shotGroups);
                  const spreads = groups.map((g) => g.extremeSpreadMm).filter((v): v is number => v != null);
                  const sds = groups.flatMap((g) => g.velocitySets.map((v) => v.sdMps)).filter((v): v is number => v != null);
                  return (
                    <li key={cycle.loadNumber} className="relative">
                      <span
                        aria-hidden
                        className="absolute -left-[1.95rem] top-3 flex size-5 items-center justify-center rounded-full border-2 border-white bg-brand text-[10px] font-bold text-white dark:border-neutral-950 dark:text-neutral-950"
                      >
                        {cycle.loadCount ?? i + 1}
                      </span>
                      <Card padded={false} className="px-4 py-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">
                              {cycle.loadCount != null ? `${cycle.loadCount}. Ladung` : `Zyklus ${i + 1}`}
                            </span>
                            <span className="text-sm tabular-nums text-neutral-500 dark:text-neutral-400">
                              {formatDate(cycle.date)}
                            </span>
                          </div>
                          {(spreads.length > 0 || sds.length > 0) && (
                            <div className="flex gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                              {spreads.length > 0 && (
                                <span>
                                  beste ES{" "}
                                  <span className="font-medium text-neutral-800 dark:text-neutral-200">
                                    <UnitValueDisplay kind="length" value={Math.min(...spreads)} fractionDigits={1} />
                                  </span>
                                </span>
                              )}
                              {sds.length > 0 && (
                                <span>
                                  beste SD{" "}
                                  <span className="font-medium text-neutral-800 dark:text-neutral-200">
                                    <UnitValueDisplay kind="velocity" value={Math.min(...sds)} fractionDigits={1} />
                                  </span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <ul className="mt-2 flex flex-col divide-y divide-neutral-100 dark:divide-neutral-800">
                          {cycle.loads.map((l) => (
                            <li key={l.id}>
                              <Link
                                href={`/loads/${l.id}`}
                                className="flex items-center gap-3 py-1.5 text-sm hover:text-neutral-900 dark:hover:text-white"
                              >
                                <LoadNumberBadge>{formatLoadNumber(l.loadNumber, l.variantLetter)}</LoadNumberBadge>
                                <span className="min-w-0 flex-1 truncate text-neutral-600 dark:text-neutral-300">
                                  {[l.powder, l.bullet].filter(Boolean).join(" · ") || l.firearm.name}
                                </span>
                                <span className="shrink-0 font-medium tabular-nums">
                                  <UnitValueDisplay kind="weight" value={l.chargeGrains} />
                                </span>
                                {l.caseQuantity != null && (
                                  <span className="hidden shrink-0 text-xs tabular-nums text-neutral-500 sm:inline">
                                    {l.caseQuantity} Stk
                                  </span>
                                )}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    </li>
                  );
                })}
              </ol>
            )}
          </Section>
        </div>

        <Section title="Daten bearbeiten">
          <CaseLotForm lot={lot} knownCalibers={knownCalibers} />
        </Section>
      </div>
    </div>
  );
}
