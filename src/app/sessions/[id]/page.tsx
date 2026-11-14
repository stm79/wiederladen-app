import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { AddShotGroupSection } from "@/components/sessions/AddShotGroupSection";
import { GroupCard } from "@/components/sessions/GroupCard";
import { SessionDetailsCard } from "@/components/sessions/SessionDetailsCard";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState, PageHeader, Section } from "@/components/ui/Layout";
import { Icon } from "@/components/ui/Icon";
import { deleteSession } from "@/app/actions/sessions";
import { formatDateLong } from "@/lib/format-date";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [session, firearms, allLoadsRaw] = await Promise.all([
    prisma.session.findUnique({
      where: { id },
      include: {
        sessionLoads: { include: { load: { include: { firearm: { select: { caliber: true } } } } } },
        sessionFirearms: { include: { firearm: { select: { name: true } } } },
        groups: {
          include: { images: true, velocitySets: { include: { shots: true }, orderBy: { importedAt: "desc" } } },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    prisma.firearm.findMany({ orderBy: { name: "asc" } }),
    prisma.load.findMany({
      orderBy: { createdAt: "desc" },
      include: { firearm: { select: { caliber: true } } },
    }),
  ]);

  if (!session) notFound();

  const allLoads = allLoadsRaw.map((load) => ({ ...load, caliber: load.firearm.caliber }));
  const sessionLoadOptions = session.sessionLoads.map((sl) => ({ ...sl.load, caliber: sl.load.firearm.caliber }));
  const findLoad = (loadId: string | null) => {
    if (!loadId) return null;
    return sessionLoadOptions.find((l) => l.id === loadId) ?? allLoads.find((l) => l.id === loadId) ?? null;
  };
  const groupLoadOptions = sessionLoadOptions.length > 0 ? sessionLoadOptions : allLoads;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        back={{ href: "/sessions", label: "Sessions" }}
        title={formatDateLong(session.date)}
        subtitle={
          session.location && (
            <span className="inline-flex items-center gap-1.5">
              <Icon name="mapPin" size={15} className="text-neutral-400" />
              {session.location}
            </span>
          )
        }
        actions={
          <>
            <LinkButton href={`/api/export/pdf/sessions/${session.id}`} variant="secondary" icon="file" external>
              PDF
            </LinkButton>
            <DeleteButton
              id={session.id}
              action={deleteSession}
              redirectTo="/sessions"
              confirmMessage="Diese Session inkl. aller Schussgruppen und Bilder wirklich löschen?"
            />
          </>
        }
      />

      <SessionDetailsCard
        firearms={firearms}
        loads={allLoads}
        session={session}
        firearmNames={session.sessionFirearms.map((sf) => sf.firearm.name)}
      />

      <Section title={`Schussgruppen${session.groups.length > 0 ? ` (${session.groups.length})` : ""}`}>
        {session.groups.length === 0 && (
          <EmptyState
            icon="crosshair"
            title="Noch keine Schussgruppen"
            description="Lege eine Gruppe an und füge dann ein Foto zur Vermessung oder Chrono-Daten hinzu."
          />
        )}

        <AddShotGroupSection sessionId={session.id} loads={groupLoadOptions} />

        {session.groups.length > 0 && (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {session.groups.map((group) => (
              <GroupCard
                key={group.id}
                sessionId={session.id}
                group={group}
                load={findLoad(group.loadId)}
                loads={groupLoadOptions}
              />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
