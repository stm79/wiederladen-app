import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LoadForm } from "@/components/forms/LoadForm";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { DuplicateButton } from "@/components/ui/DuplicateButton";
import { Button } from "@/components/ui/Button";
import { deleteLoad } from "@/app/actions/loads";
import { getDistinctLoadFieldValues } from "@/lib/loads/distinct-values";
import { formatLoadNumber } from "@/lib/loads/variant-letter";

export default async function LoadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [load, firearms, known] = await Promise.all([
    prisma.load.findUnique({
      where: { id },
      include: { parentLoad: true, variants: { orderBy: { createdAt: "desc" } } },
    }),
    prisma.firearm.findMany({ orderBy: { name: "asc" } }),
    getDistinctLoadFieldValues(),
  ]);

  if (!load) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:justify-between">
        <div className="max-w-2xl flex-1">
          <h1 className="mb-1 text-xl font-semibold">Ladung bearbeiten</h1>
          {load.parentLoad && (
            <p className="mb-4 text-sm text-neutral-500">
              Variante von{" "}
              <Link href={`/loads/${load.parentLoad.id}`} className="underline">
                {load.parentLoad.name ?? "Basisladung"}
              </Link>
            </p>
          )}
          <LoadForm
            firearms={firearms}
            load={load}
            knownPowders={known.powders}
            knownBullets={known.bullets}
            knownPrimers={known.primers}
          />
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <a href={`/api/export/pdf/loads/${load.id}`} className="text-center">
            <Button type="button" variant="secondary" className="w-full">
              PDF-Bericht
            </Button>
          </a>
          <Link href={`/loads/${load.id}/label`} className="text-center">
            <Button type="button" variant="secondary" className="w-full">
              Dymo-Label
            </Button>
          </Link>
          <DuplicateButton id={load.id} />
          <DeleteButton
            id={load.id}
            action={deleteLoad}
            redirectTo="/loads"
            confirmMessage="Diese Ladung wirklich löschen?"
          />
        </div>
      </div>

      {load.variants.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Varianten dieser Ladung</h2>
          <div className="flex flex-col divide-y divide-neutral-200 dark:divide-neutral-800">
            {load.variants.map((variant) => (
              <Link
                key={variant.id}
                href={`/loads/${variant.id}`}
                className="py-2 hover:bg-neutral-50 dark:hover:bg-neutral-900"
              >
                <span className="mr-2 text-neutral-400 tabular-nums">
                  {formatLoadNumber(variant.loadNumber, variant.variantLetter)}
                </span>
                {variant.name ?? "Ladung"}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
