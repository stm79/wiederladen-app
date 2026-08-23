import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { UnitValueDisplay } from "@/components/units/UnitValueDisplay";
import { formatLoadNumber } from "@/lib/loads/variant-letter";
import { loadDisplayName } from "@/lib/loads/label";

export const dynamic = "force-dynamic";

export default async function LoadsPage() {
  const loads = await prisma.load.findMany({
    orderBy: { createdAt: "desc" },
    include: { firearm: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Ladedaten</h1>
        <Link href="/loads/new">
          <Button>+ Neue Ladung</Button>
        </Link>
      </div>

      {loads.length === 0 ? (
        <p className="text-sm text-neutral-500">Noch keine Ladedaten angelegt.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-neutral-500 dark:border-neutral-800">
                <th className="py-2 pr-4 font-medium">Nr.</th>
                <th className="py-2 pr-4 font-medium">Ladung</th>
                <th className="py-2 pr-4 font-medium">Waffe</th>
                <th className="py-2 pr-4 font-medium">Pulver</th>
                <th className="py-2 pr-4 font-medium">Ladung</th>
                <th className="py-2 pr-4 font-medium">Geschoss</th>
              </tr>
            </thead>
            <tbody>
              {loads.map((load) => (
                <tr
                  key={load.id}
                  className="relative cursor-pointer border-b border-neutral-100 hover:bg-neutral-50 dark:border-neutral-900 dark:hover:bg-neutral-900"
                >
                  <td className="py-2 pr-4 tabular-nums text-neutral-500">
                    {formatLoadNumber(load.loadNumber, load.variantLetter)}
                  </td>
                  <td className="py-2 pr-4 font-medium">
                    {/* Stretched link: fills the whole row so clicking anywhere
                        in it navigates, not just this cell's text. Stays in the
                        accessible/tab order via aria-label since the visible
                        name text below it is no longer its own link. */}
                    <Link
                      href={`/loads/${load.id}`}
                      className="absolute inset-0"
                      aria-label={`${loadDisplayName({ name: load.name, caliber: load.firearm.caliber, bulletWeightGr: load.bulletWeightGr, bullet: load.bullet })} bearbeiten`}
                    />
                    {loadDisplayName({
                      name: load.name,
                      caliber: load.firearm.caliber,
                      bulletWeightGr: load.bulletWeightGr,
                      bullet: load.bullet,
                    })}
                  </td>
                  <td className="py-2 pr-4">{load.firearm.name}</td>
                  <td className="py-2 pr-4">{load.powder || "—"}</td>
                  <td className="py-2 pr-4">
                    <UnitValueDisplay kind="weight" value={load.chargeGrains} />
                  </td>
                  <td className="py-2 pr-4">
                    {load.bulletWeightGr ? (
                      <>
                        {load.bullet} <UnitValueDisplay kind="weight" value={load.bulletWeightGr} />
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
