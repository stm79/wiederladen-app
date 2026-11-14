import { LinkButton } from "@/components/ui/Button";
import { EmptyState, PageHeader } from "@/components/ui/Layout";
import { prisma } from "@/lib/prisma";
import { LoadForm } from "@/components/forms/LoadForm";
import { getDistinctLoadFieldValues } from "@/lib/loads/distinct-values";

// Depends on the current firearms/loads lists and suggested next load
// number, which aren't revalidated from this route — always render fresh.
export const dynamic = "force-dynamic";

export default async function NewLoadPage({
  searchParams,
}: {
  searchParams: Promise<{ firearmId?: string }>;
}) {
  const { firearmId } = await searchParams;
  const [firearms, known, maxLoadNumber] = await Promise.all([
    prisma.firearm.findMany({ orderBy: { name: "asc" } }),
    getDistinctLoadFieldValues(),
    prisma.load.aggregate({ _max: { loadNumber: true } }),
  ]);
  const suggestedLoadNumber = (maxLoadNumber._max.loadNumber ?? 0) + 1;

  if (firearms.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader back={{ href: "/loads", label: "Ladedaten" }} title="Neue Ladung" />
        <EmptyState
          icon="crosshair"
          title="Zuerst eine Waffe anlegen"
          description="Jede Ladung gehört zu einer Waffe."
          action={
            <LinkButton href="/firearms/new" icon="plus">
              Waffe anlegen
            </LinkButton>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <PageHeader back={{ href: "/loads", label: "Ladedaten" }} title="Neue Ladung" />
      <LoadForm
        firearms={firearms}
        defaultFirearmId={firearmId}
        suggestedLoadNumber={suggestedLoadNumber}
        knownPowders={known.powders}
        knownBullets={known.bullets}
        knownPrimers={known.primers}
      />
    </div>
  );
}
