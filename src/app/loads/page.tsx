import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { UnitValueDisplay } from "@/components/units/UnitValueDisplay";
import { formatLoadNumber } from "@/lib/loads/variant-letter";
import { loadDisplayName } from "@/lib/loads/label";

export const dynamic = "force-dynamic";

const SORT_KEYS = ["number", "name", "firearm", "powder", "charge", "bullet"] as const;
type SortKey = (typeof SORT_KEYS)[number];
type SortDir = "asc" | "desc";

function compareLoads(
  a: { loadNumber: number; variantLetter: string; label: string; firearmName: string; powder: string | null; chargeGrains: number; bullet: string | null; bulletWeightGr: number | null },
  b: typeof a,
  sort: SortKey
): number {
  switch (sort) {
    case "number":
      return a.loadNumber - b.loadNumber || a.variantLetter.localeCompare(b.variantLetter);
    case "name":
      return a.label.localeCompare(b.label, "de");
    case "firearm":
      return a.firearmName.localeCompare(b.firearmName, "de");
    case "powder":
      return (a.powder ?? "").localeCompare(b.powder ?? "", "de");
    case "charge":
      return a.chargeGrains - b.chargeGrains;
    case "bullet":
      return (a.bullet ?? "").localeCompare(b.bullet ?? "", "de") || (a.bulletWeightGr ?? 0) - (b.bulletWeightGr ?? 0);
  }
}

function SortableHeader({
  label,
  sortKey,
  currentSort,
  currentDir,
}: {
  label: string;
  sortKey: SortKey;
  currentSort: SortKey;
  currentDir: SortDir;
}) {
  const isActive = currentSort === sortKey;
  const nextDir: SortDir = isActive && currentDir === "asc" ? "desc" : "asc";
  return (
    <th className="py-2 pr-4 font-medium">
      <Link
        href={`/loads?sort=${sortKey}&dir=${nextDir}`}
        className="inline-flex items-center gap-1 hover:text-neutral-900 dark:hover:text-neutral-100"
      >
        {label}
        {isActive && <span aria-hidden="true">{currentDir === "asc" ? "▲" : "▼"}</span>}
      </Link>
    </th>
  );
}

export default async function LoadsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; dir?: string }>;
}) {
  const params = await searchParams;
  const sort: SortKey = SORT_KEYS.includes(params.sort as SortKey) ? (params.sort as SortKey) : "number";
  const dir: SortDir = params.dir === "desc" ? "desc" : "asc";

  const loadsRaw = await prisma.load.findMany({
    include: { firearm: true },
  });

  const loads = loadsRaw
    .map((load) => ({
      ...load,
      label: loadDisplayName({
        name: load.name,
        caliber: load.firearm.caliber,
        bulletWeightGr: load.bulletWeightGr,
        bullet: load.bullet,
      }),
      firearmName: load.firearm.name,
    }))
    .sort((a, b) => (dir === "desc" ? -1 : 1) * compareLoads(a, b, sort));

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
                <SortableHeader label="Nr." sortKey="number" currentSort={sort} currentDir={dir} />
                <SortableHeader label="Ladung" sortKey="name" currentSort={sort} currentDir={dir} />
                <SortableHeader label="Waffe" sortKey="firearm" currentSort={sort} currentDir={dir} />
                <SortableHeader label="Pulver" sortKey="powder" currentSort={sort} currentDir={dir} />
                <SortableHeader label="Ladungsmenge" sortKey="charge" currentSort={sort} currentDir={dir} />
                <SortableHeader label="Geschoss" sortKey="bullet" currentSort={sort} currentDir={dir} />
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
                    <Link href={`/loads/${load.id}`} className="absolute inset-0" aria-label={`${load.label} bearbeiten`} />
                    {load.label}
                  </td>
                  <td className="py-2 pr-4">{load.firearmName}</td>
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
