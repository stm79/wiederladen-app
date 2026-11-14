import { PageHeader } from "@/components/ui/Layout";
import { prisma } from "@/lib/prisma";
import { SessionForm } from "@/components/forms/SessionForm";

// Depends on the current firearms/loads lists, which aren't revalidated from
// this route — always render fresh rather than risk a stale dropdown.
export const dynamic = "force-dynamic";

export default async function NewSessionPage() {
  const [firearms, loadsRaw] = await Promise.all([
    prisma.firearm.findMany({ orderBy: { name: "asc" } }),
    prisma.load.findMany({
      orderBy: { createdAt: "desc" },
      include: { firearm: { select: { caliber: true } } },
    }),
  ]);
  const loads = loadsRaw.map((load) => ({ ...load, caliber: load.firearm.caliber }));

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <PageHeader
        back={{ href: "/sessions", label: "Sessions" }}
        title="Neue Session"
        subtitle="Chrono-Daten kannst du direkt hier einer Ladung zuweisen. Fotos und weitere Schussgruppen fügst du nach dem Anlegen hinzu."
      />
      <SessionForm firearms={firearms} loads={loads} />
    </div>
  );
}
