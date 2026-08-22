import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function FirearmsPage() {
  const firearms = await prisma.firearm.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { loads: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Waffen</h1>
        <Link href="/firearms/new">
          <Button>+ Neue Waffe</Button>
        </Link>
      </div>

      {firearms.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Noch keine Waffe angelegt. Lege zuerst eine Waffe an, um Ladedaten zuzuordnen.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {firearms.map((firearm) => (
            <Link
              key={firearm.id}
              href={`/firearms/${firearm.id}`}
              className="rounded-lg border border-neutral-200 p-4 hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
            >
              <div className="font-medium">{firearm.name}</div>
              <div className="text-sm text-neutral-500">{firearm.caliber}</div>
              <div className="mt-2 text-xs text-neutral-400">
                {firearm._count.loads} Ladedaten
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
