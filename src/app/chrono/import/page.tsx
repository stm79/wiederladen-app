import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ImportWizard } from "@/components/chrono/ImportWizard";

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
    include: { session: true, load: true },
  });
  if (!group) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          Chrono-Daten importieren
          <span className="ml-2 text-sm font-normal text-neutral-500">
            {group.load?.name ?? group.load?.powder ?? "Ohne Ladung"}
          </span>
        </h1>
        <Link href={`/sessions/${group.sessionId}`} className="text-sm text-neutral-500 underline">
          Zurück zur Session
        </Link>
      </div>
      <ImportWizard groupId={group.id} sessionId={group.sessionId} />
    </div>
  );
}
