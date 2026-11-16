import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LoadForm } from "@/components/forms/LoadForm";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { CloneLoadButton } from "@/components/loads/CloneLoadButton";
import { LinkButton } from "@/components/ui/Button";
import { ListCard, ListRow, LoadNumberBadge, PageHeader, Section } from "@/components/ui/Layout";
import { UnitValueDisplay } from "@/components/units/UnitValueDisplay";
import { LoadChecklist } from "@/components/loads/LoadChecklist";
import { deleteLoad } from "@/app/actions/loads";
import { getDistinctLoadFieldValues } from "@/lib/loads/distinct-values";
import { formatLoadNumber } from "@/lib/loads/variant-letter";
import { loadDisplayName } from "@/lib/loads/label";
import { formatDate } from "@/lib/format-date";
import { getCaseLotOptions } from "@/lib/case-lots/options";
import { caseLotLabel } from "@/lib/case-lots/history";

export default async function LoadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [load, firearms, known, checklistSteps, caseLots] = await Promise.all([
    prisma.load.findUnique({
      where: { id },
      include: {
        firearm: true,
        caseLot: { select: { id: true, number: true, name: true } },
        parentLoad: { include: { firearm: { select: { caliber: true } } } },
        variants: { orderBy: { createdAt: "desc" }, include: { firearm: { select: { caliber: true } } } },
        shotGroups: { include: { session: true }, orderBy: { createdAt: "desc" } },
        checklistChecks: true,
      },
    }),
    prisma.firearm.findMany({ orderBy: { name: "asc" } }),
    getDistinctLoadFieldValues(),
    prisma.checklistStep.findMany({ orderBy: { sortOrder: "asc" } }),
    getCaseLotOptions(),
  ]);

  if (!load) notFound();

  const { firearm, caseLot, ...loadFields } = load;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        stackActions
        back={{ href: "/loads", label: "Ladedaten" }}
        badge={<LoadNumberBadge large>{formatLoadNumber(load.loadNumber, load.variantLetter)}</LoadNumberBadge>}
        title={loadDisplayName({ ...load, caliber: firearm.caliber })}
        subtitle={
          <>
            <Link href={`/firearms/${firearm.id}`} className="hover:text-neutral-900 hover:underline dark:hover:text-white">
              {firearm.name}
            </Link>
            {load.parentLoad && (
              <>
                {" · Variante von "}
                <Link href={`/loads/${load.parentLoad.id}`} className="hover:text-neutral-900 hover:underline dark:hover:text-white">
                  {formatLoadNumber(load.parentLoad.loadNumber, load.parentLoad.variantLetter)}
                </Link>
              </>
            )}
            {caseLot && (
              <>
                {" · Hülsen "}
                <Link href={`/cases/${caseLot.id}`} className="hover:text-neutral-900 hover:underline dark:hover:text-white">
                  {caseLotLabel(caseLot)}
                </Link>
                {load.caseLoadCount != null && ` (${load.caseLoadCount}×)`}
              </>
            )}
          </>
        }
        actions={
          <>
            <LinkButton href={`/loads/${load.id}/label`} variant="secondary" icon="tag">
              Etikett
            </LinkButton>
            <LinkButton href={`/api/export/pdf/loads/${load.id}`} variant="secondary" icon="file" external>
              PDF
            </LinkButton>
            <CloneLoadButton id={load.id} />
            <DeleteButton
              id={load.id}
              action={deleteLoad}
              redirectTo="/loads"
              confirmMessage="Diese Ladung wirklich löschen?"
            />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:grid-rows-[auto_1fr] lg:items-start">
        <aside className="min-w-0 lg:col-start-2 lg:row-start-1">
          <LoadChecklist
            loadId={load.id}
            steps={checklistSteps}
            checkedStepIds={load.checklistChecks.map((c) => c.stepId)}
          />
        </aside>

        <div className="min-w-0 lg:col-start-1 lg:row-span-2 lg:row-start-1">
          <LoadForm
            firearms={firearms}
            load={loadFields}
            knownPowders={known.powders}
            knownBullets={known.bullets}
            knownPrimers={known.primers}
            knownSizingDies={known.sizingDies}
            knownSeatingDies={known.seatingDies}
            caseLots={caseLots}
          />
        </div>

        <aside className="flex min-w-0 flex-col gap-6 lg:col-start-2 lg:row-start-2">
          <Section title="Schussgruppen">
            {load.shotGroups.length === 0 ? (
              <p className="text-sm text-neutral-500">Noch nicht geschossen.</p>
            ) : (
              <ListCard>
                {load.shotGroups.map((group) => (
                  <ListRow key={group.id} href={`/sessions/${group.sessionId}`}>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium tabular-nums">{formatDate(group.session.date)}</div>
                      <div className="truncate text-sm text-neutral-500 dark:text-neutral-400">
                        {[
                          group.distanceM ? `${group.distanceM} m` : null,
                          group.shotCount ? `${group.shotCount} Schuss` : null,
                          group.session.location,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                    </div>
                    <span className="shrink-0 text-sm font-medium tabular-nums">
                      <UnitValueDisplay kind="length" value={group.extremeSpreadMm} fractionDigits={1} />
                    </span>
                  </ListRow>
                ))}
              </ListCard>
            )}
          </Section>

          {load.variants.length > 0 && (
            <Section title="Varianten">
              <ListCard>
                {load.variants.map((variant) => (
                  <ListRow key={variant.id} href={`/loads/${variant.id}`}>
                    <LoadNumberBadge>{formatLoadNumber(variant.loadNumber, variant.variantLetter)}</LoadNumberBadge>
                    <span className="min-w-0 flex-1 truncate text-sm">
                      <UnitValueDisplay kind="weight" value={variant.chargeGrains} />
                      {variant.powder ? <span className="text-neutral-500"> · {variant.powder}</span> : null}
                    </span>
                  </ListRow>
                ))}
              </ListCard>
            </Section>
          )}
        </aside>
      </div>
    </div>
  );
}
