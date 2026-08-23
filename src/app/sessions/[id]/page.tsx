import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SessionForm } from "@/components/forms/SessionForm";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { AddShotGroupSection } from "@/components/sessions/AddShotGroupSection";
import { GroupCard } from "@/components/sessions/GroupCard";
import { Button } from "@/components/ui/Button";
import { deleteSession } from "@/app/actions/sessions";
import { loadDisplayName } from "@/lib/loads/label";

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
        sessionFirearms: true,
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
  const loadLabel = (loadId: string | null) => {
    if (!loadId) return null;
    const load = sessionLoadOptions.find((l) => l.id === loadId) ?? allLoads.find((l) => l.id === loadId);
    if (!load) return null;
    return loadDisplayName(load);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:justify-between">
        <div className="max-w-2xl flex-1">
          <h1 className="mb-4 text-xl font-semibold">Session bearbeiten</h1>
          <SessionForm firearms={firearms} loads={allLoads} session={session} />
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <a href={`/api/export/pdf/sessions/${session.id}`} className="text-center">
            <Button type="button" variant="secondary" className="w-full">
              PDF-Bericht
            </Button>
          </a>
          <DeleteButton
            id={session.id}
            action={deleteSession}
            redirectTo="/sessions"
            confirmMessage="Diese Session inkl. aller Schussgruppen und Bilder wirklich löschen?"
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Schussgruppen</h2>
        </div>

        {session.groups.length === 0 ? (
          <p className="text-sm text-neutral-500">Noch keine Schussgruppen für diese Session.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {session.groups.map((group) => (
              <GroupCard
                key={group.id}
                sessionId={session.id}
                group={group}
                loadLabel={loadLabel(group.loadId)}
                loads={sessionLoadOptions.length > 0 ? sessionLoadOptions : allLoads}
              />
            ))}
          </div>
        )}

        <AddShotGroupSection
          sessionId={session.id}
          loads={sessionLoadOptions.length > 0 ? sessionLoadOptions : allLoads}
        />
      </div>
    </div>
  );
}
