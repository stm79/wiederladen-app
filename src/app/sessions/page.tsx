import { prisma } from "@/lib/prisma";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState, ListCard, ListRow, PageHeader } from "@/components/ui/Layout";
import { Icon } from "@/components/ui/Icon";

export const dynamic = "force-dynamic";

const DAY = new Intl.DateTimeFormat("de-DE", { day: "2-digit" });
const MONTH = new Intl.DateTimeFormat("de-DE", { month: "short" });
const YEAR = new Intl.DateTimeFormat("de-DE", { year: "numeric" });

export default async function SessionsPage() {
  const sessions = await prisma.session.findMany({
    orderBy: { date: "desc" },
    include: {
      sessionFirearms: { include: { firearm: true } },
      _count: { select: { groups: true } },
      groups: { select: { _count: { select: { velocitySets: true } } } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Sessions"
        subtitle={sessions.length > 0 ? "Schießtermine mit Schussgruppen und Chrono-Daten" : undefined}
        actions={
          <LinkButton href="/sessions/new" icon="plus">
            Neue Session
          </LinkButton>
        }
      />

      {sessions.length === 0 ? (
        <EmptyState
          icon="calendar"
          title="Noch keine Sessions erfasst"
          description="Eine Session ist ein Termin am Stand — dort erfasst du Schussgruppen, Fotos und Chrono-Daten."
          action={
            <LinkButton href="/sessions/new" icon="plus">
              Neue Session
            </LinkButton>
          }
        />
      ) : (
        <ListCard>
          {sessions.map((session) => {
            const chronoCount = session.groups.reduce((sum, g) => sum + g._count.velocitySets, 0);
            const firearmNames = session.sessionFirearms.map((sf) => sf.firearm.name).join(", ");
            return (
              <ListRow key={session.id} href={`/sessions/${session.id}`}>
                <div className="flex w-12 shrink-0 flex-col items-center rounded-lg border border-neutral-200 py-1 leading-none dark:border-neutral-700">
                  <span className="text-[10px] font-semibold uppercase text-brand">{MONTH.format(session.date)}</span>
                  <span className="mt-0.5 text-lg font-semibold tabular-nums">{DAY.format(session.date)}</span>
                  <span className="mt-0.5 text-[10px] tabular-nums text-neutral-400">{YEAR.format(session.date)}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{session.location || "Ohne Ort"}</div>
                  <div className="truncate text-sm text-neutral-500 dark:text-neutral-400">
                    {firearmNames || "Keine Waffe zugeordnet"}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                    <span>
                      {session._count.groups} {session._count.groups === 1 ? "Gruppe" : "Gruppen"}
                    </span>
                    <span>
                      {chronoCount} Chrono-{chronoCount === 1 ? "Satz" : "Sätze"}
                    </span>
                    {session.tempC != null && (
                      <span className="inline-flex items-center gap-0.5">
                        <Icon name="thermometer" size={12} />
                        {session.tempC} °C
                      </span>
                    )}
                  </div>
                </div>
              </ListRow>
            );
          })}
        </ListCard>
      )}
    </div>
  );
}
