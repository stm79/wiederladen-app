import { PageHeader } from "@/components/ui/Layout";
import { formatLoadNumber } from "@/lib/loads/variant-letter";
import { formatDate } from "@/lib/format-date";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ImportWizard } from "@/components/chrono/ImportWizard";
import { loadDisplayName } from "@/lib/loads/label";

// Depends on which session/loads exist right now; no revalidatePath targets this route.
export const dynamic = "force-dynamic";

export default async function ChronoImportPage({
  searchParams,
}: {
  searchParams: Promise<{ groupId?: string }>;
}) {
  const { groupId } = await searchParams;
  if (!groupId) notFound();

  const group = await prisma.shotGroup.findUnique({
    where: { id: groupId },
    include: { session: true, load: { include: { firearm: { select: { caliber: true } } } } },
  });
  if (!group) notFound();

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <PageHeader
        back={{ href: `/sessions/${group.sessionId}`, label: "Zurück zur Session" }}
        title="Chrono-Daten importieren"
        subtitle={
          <>
            {group.load
              ? `${formatLoadNumber(group.load.loadNumber, group.load.variantLetter)} ${loadDisplayName({ ...group.load, caliber: group.load.firearm.caliber })}`
              : "Ohne Ladung"}
            {" · "}
            {formatDate(group.session.date)}
          </>
        }
      />
      <ImportWizard groupId={group.id} sessionId={group.sessionId} />
    </div>
  );
}
