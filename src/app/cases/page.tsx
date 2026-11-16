import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Badge, EmptyState, PageHeader, Section } from "@/components/ui/Layout";
import { caseLotCycles, formatCaseLotNumber } from "@/lib/case-lots/history";
import { formatLoadNumber } from "@/lib/loads/variant-letter";

export const dynamic = "force-dynamic";

export default async function CaseLotsPage() {
  const lots = await prisma.caseLot.findMany({
    orderBy: { number: "desc" },
    include: {
      loads: { select: { id: true, loadNumber: true, variantLetter: true, caseLoadCount: true, createdAt: true } },
    },
  });

  const cards = lots.map((lot) => {
    const cycles = caseLotCycles(lot.loads);
    const last = cycles.at(-1);
    return { lot, cycles, last };
  });
  const active = cards.filter((c) => !c.lot.retired);
  const retired = cards.filter((c) => c.lot.retired);

  const grid = (items: typeof cards) => (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ lot, cycles, last }) => (
        <Link
          key={lot.id}
          href={`/cases/${lot.id}`}
          className="group flex flex-col gap-4 rounded-xl border border-neutral-200/80 bg-white p-5 shadow-xs transition-colors hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft px-2 font-mono text-sm font-semibold text-brand-strong">
              {formatCaseLotNumber(lot.number)}
            </span>
            <div className="min-w-0">
              <div className="truncate font-semibold">{lot.name}</div>
              <div className="truncate text-sm text-neutral-500 dark:text-neutral-400">
                {[lot.brand, lot.caliber].filter(Boolean).join(" · ") || "—"}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-neutral-100 pt-3 text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
            {lot.quantity != null && (
              <span>
                <span className="font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">{lot.quantity}</span> Stück
              </span>
            )}
            <span>
              <span className="font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
                {last?.loadCount ?? cycles.length}×
              </span>{" "}
              geladen
            </span>
            {last && (
              <span className="ml-auto font-mono text-xs">
                zuletzt {formatLoadNumber(last.loadNumber, last.loads.length === 1 ? last.loads[0].variantLetter : "")}
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Hülsen"
        subtitle="Hülsen-Chargen und welche Ladungen daraus geladen wurden"
        actions={
          <LinkButton href="/cases/new" icon="plus">
            Neue Charge
          </LinkButton>
        }
      />

      {lots.length === 0 ? (
        <EmptyState
          icon="cartridge"
          title="Noch keine Hülsen-Charge"
          description="Lege eine Charge an und ordne sie im Tab „Hülse“ deinen Ladungen zu — dann siehst du, wo die Hülsen schon überall drin waren."
          action={
            <LinkButton href="/cases/new" icon="plus">
              Neue Charge
            </LinkButton>
          }
        />
      ) : (
        <>
          {active.length > 0 ? grid(active) : <p className="text-sm text-neutral-500">Alle Chargen sind ausgemustert.</p>}
          {retired.length > 0 && (
            <Section
              title={
                <span className="flex items-center gap-2">
                  Ausgemustert <Badge>{retired.length}</Badge>
                </span>
              }
            >
              <div className="opacity-70">{grid(retired)}</div>
            </Section>
          )}
        </>
      )}
      {lots.length > 0 && (
        <p className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
          <Icon name="cartridge" size={14} />
          „geladen“ = Load Count des letzten Ladezyklus, sonst die Zahl der Ladezyklen.
        </p>
      )}
    </div>
  );
}
