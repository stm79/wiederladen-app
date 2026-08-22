import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LoadForm } from "@/components/forms/LoadForm";
import { getDistinctLoadFieldValues } from "@/lib/loads/distinct-values";

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
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold">Neue Ladung</h1>
        <p className="text-sm text-neutral-500">
          Lege zuerst eine Waffe an, bevor du Ladedaten erfassen kannst.
        </p>
        <Link href="/firearms/new" className="text-sm text-neutral-700 underline dark:text-neutral-300">
          Waffe anlegen
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Neue Ladung</h1>
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
