import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { loadDisplayName } from "@/lib/loads/label";
import { formatLoadNumber } from "@/lib/loads/variant-letter";
import { formatDate } from "@/lib/format-date";
import { Icon, type IconName } from "@/components/ui/Icon";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState, ListCard, ListRow, LoadNumberBadge, PageHeader, Section } from "@/components/ui/Layout";
import { UnitValueDisplay } from "@/components/units/UnitValueDisplay";

// Aggregates counts across entities touched by every phase's mutations;
// simpler to always render fresh than to wire revalidatePath("/") into each one.
export const dynamic = "force-dynamic";

async function getData() {
  const [firearms, loads, sessions, recentLoads, recentSessions] = await Promise.all([
    prisma.firearm.count(),
    prisma.load.count(),
    prisma.session.count(),
    prisma.load.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { firearm: true } }),
    prisma.session.findMany({
      orderBy: { date: "desc" },
      take: 5,
      include: { _count: { select: { groups: true } } },
    }),
  ]);
  return { counts: { firearms, loads, sessions }, recentLoads, recentSessions };
}

function Tile({ label, value, href, icon }: { label: string; value: number; href: string; icon: IconName }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-neutral-200/80 bg-white p-4 shadow-xs transition-colors hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
    >
      <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 group-hover:text-brand sm:flex dark:bg-neutral-800 dark:text-neutral-400">
        <Icon name={icon} size={19} />
      </span>
      <div>
        <div className="text-2xl font-semibold tabular-nums leading-none">{value}</div>
        <div className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{label}</div>
      </div>
    </Link>
  );
}

export default async function DashboardPage() {
  const { counts, recentLoads, recentSessions } = await getData();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Übersicht"
        actions={
          counts.firearms > 0 && (
            <>
              <LinkButton href="/sessions/new" variant="secondary" icon="calendar">
                Neue Session
              </LinkButton>
              <LinkButton href="/loads/new" icon="plus">
                Neue Ladung
              </LinkButton>
            </>
          )
        }
      />

      <div className="grid grid-cols-3 gap-3">
        <Tile label="Ladedaten" value={counts.loads} href="/loads" icon="flask" />
        <Tile label="Sessions" value={counts.sessions} href="/sessions" icon="calendar" />
        <Tile label="Waffen" value={counts.firearms} href="/firearms" icon="crosshair" />
      </div>

      {counts.firearms === 0 ? (
        <EmptyState
          icon="crosshair"
          title="Willkommen!"
          description="Lege zuerst eine Waffe an — danach kannst du Ladedaten und Sessions erfassen."
          action={
            <LinkButton href="/firearms/new" icon="plus">
              Waffe anlegen
            </LinkButton>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Section
            title="Letzte Ladedaten"
            action={
              <Link href="/loads" className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
                Alle anzeigen
              </Link>
            }
          >
            {recentLoads.length === 0 ? (
              <EmptyState icon="flask" title="Noch keine Ladedaten" />
            ) : (
              <ListCard>
                {recentLoads.map((load) => (
                  <ListRow key={load.id} href={`/loads/${load.id}`}>
                    <LoadNumberBadge>{formatLoadNumber(load.loadNumber, load.variantLetter)}</LoadNumberBadge>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">
                        {loadDisplayName({ ...load, caliber: load.firearm.caliber })}
                      </div>
                      <div className="truncate text-sm text-neutral-500 dark:text-neutral-400">
                        {load.firearm.name}
                        {load.powder ? ` · ${load.powder}` : ""}
                      </div>
                    </div>
                    <span className="shrink-0 text-sm tabular-nums text-neutral-600 dark:text-neutral-300">
                      <UnitValueDisplay kind="weight" value={load.chargeGrains} />
                    </span>
                  </ListRow>
                ))}
              </ListCard>
            )}
          </Section>

          <Section
            title="Letzte Sessions"
            action={
              <Link href="/sessions" className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
                Alle anzeigen
              </Link>
            }
          >
            {recentSessions.length === 0 ? (
              <EmptyState icon="calendar" title="Noch keine Sessions" />
            ) : (
              <ListCard>
                {recentSessions.map((session) => (
                  <ListRow key={session.id} href={`/sessions/${session.id}`}>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium tabular-nums">{formatDate(session.date)}</div>
                      <div className="truncate text-sm text-neutral-500 dark:text-neutral-400">
                        {session.location || "Ohne Ort"}
                      </div>
                    </div>
                    <span className="shrink-0 text-sm text-neutral-500 dark:text-neutral-400">
                      {session._count.groups} {session._count.groups === 1 ? "Gruppe" : "Gruppen"}
                    </span>
                  </ListRow>
                ))}
              </ListCard>
            )}
          </Section>
        </div>
      )}
    </div>
  );
}
