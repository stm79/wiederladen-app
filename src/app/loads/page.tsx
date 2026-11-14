import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { EmptyState, ListCard, ListRow, LoadNumberBadge, PageHeader } from "@/components/ui/Layout";
import { inputClass } from "@/components/forms/FormField";
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
  query,
  align,
}: {
  label: string;
  sortKey: SortKey;
  currentSort: SortKey;
  currentDir: SortDir;
  query: string;
  align?: "right";
}) {
  const isActive = currentSort === sortKey;
  const nextDir: SortDir = isActive && currentDir === "asc" ? "desc" : "asc";
  const params = new URLSearchParams({ sort: sortKey, dir: nextDir });
  if (query) params.set("q", query);
  return (
    <th
      className={`px-4 py-2.5 text-xs font-medium uppercase tracking-wide ${align === "right" ? "text-right" : ""}`}
      aria-sort={isActive ? (currentDir === "asc" ? "ascending" : "descending") : undefined}
    >
      <Link
        href={`/loads?${params}`}
        className={`inline-flex items-center gap-1 hover:text-neutral-900 dark:hover:text-neutral-100 ${isActive ? "text-neutral-900 dark:text-neutral-100" : ""}`}
      >
        {label}
        <Icon
          name="chevronDown"
          size={13}
          className={isActive ? (currentDir === "asc" ? "rotate-180" : "") : "opacity-0"}
        />
      </Link>
    </th>
  );
}

function matchesQuery(
  load: { label: string; firearmName: string; powder: string | null; bullet: string | null; primer: string | null; number: string },
  q: string
): boolean {
  const haystack = [load.label, load.firearmName, load.powder, load.bullet, load.primer, load.number]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}

export default async function LoadsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; dir?: string; q?: string }>;
}) {
  const params = await searchParams;
  const sort: SortKey = SORT_KEYS.includes(params.sort as SortKey) ? (params.sort as SortKey) : "number";
  const dir: SortDir = params.dir === "desc" ? "desc" : "asc";
  const query = (params.q ?? "").trim();

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
      number: formatLoadNumber(load.loadNumber, load.variantLetter),
    }))
    .filter((load) => !query || matchesQuery(load, query))
    .sort((a, b) => (dir === "desc" ? -1 : 1) * compareLoads(a, b, sort));

  const totalCount = loadsRaw.length;
  const headerProps = { currentSort: sort, currentDir: dir, query };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Ladedaten"
        subtitle={totalCount > 0 ? `${totalCount} ${totalCount === 1 ? "Ladung" : "Ladungen"}` : undefined}
        actions={
          <LinkButton href="/loads/new" icon="plus">
            Neue Ladung
          </LinkButton>
        }
      />

      {totalCount === 0 ? (
        <EmptyState
          icon="flask"
          title="Noch keine Ladedaten"
          description="Lege deine erste Ladung an."
          action={
            <LinkButton href="/loads/new" icon="plus">
              Neue Ladung
            </LinkButton>
          }
        />
      ) : (
        <>
          <form action="/loads" className="relative max-w-md">
            <input type="hidden" name="sort" value={sort} />
            <input type="hidden" name="dir" value={dir} />
            <Icon
              name="search"
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Suchen: Nummer, Pulver, Geschoss, Waffe…"
              className={`${inputClass} pl-9`}
              aria-label="Ladedaten durchsuchen"
            />
          </form>

          {loads.length === 0 ? (
            <EmptyState
              icon="search"
              title="Keine Treffer"
              description={`Keine Ladung passt zu „${query}“.`}
              action={
                <LinkButton href={`/loads?sort=${sort}&dir=${dir}`} variant="secondary">
                  Suche zurücksetzen
                </LinkButton>
              }
            />
          ) : (
            <>
              {/* Mobile: cards */}
              <div className="md:hidden">
                <ListCard>
                  {loads.map((load) => (
                    <ListRow key={load.id} href={`/loads/${load.id}`}>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <LoadNumberBadge>{load.number}</LoadNumberBadge>
                          <span className="truncate text-sm text-neutral-500 dark:text-neutral-400">{load.firearmName}</span>
                        </div>
                        <div className="mt-1 truncate font-medium">{load.label}</div>
                        <div className="mt-0.5 flex flex-wrap gap-x-3 text-sm text-neutral-500 dark:text-neutral-400">
                          <span className="font-medium text-neutral-800 dark:text-neutral-200">
                            <UnitValueDisplay kind="weight" value={load.chargeGrains} />
                          </span>
                          {load.powder && <span className="truncate">{load.powder}</span>}
                        </div>
                      </div>
                    </ListRow>
                  ))}
                </ListCard>
              </div>

              {/* Desktop: sortable table */}
              <div className="hidden overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-xs md:block dark:border-neutral-800 dark:bg-neutral-900">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50/80 text-left text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                      <SortableHeader label="Nr." sortKey="number" {...headerProps} />
                      <SortableHeader label="Ladung" sortKey="name" {...headerProps} />
                      <SortableHeader label="Waffe" sortKey="firearm" {...headerProps} />
                      <SortableHeader label="Pulver" sortKey="powder" {...headerProps} />
                      <SortableHeader label="Menge" sortKey="charge" {...headerProps} align="right" />
                      <SortableHeader label="Geschoss" sortKey="bullet" {...headerProps} />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {loads.map((load) => (
                      <tr
                        key={load.id}
                        className="relative cursor-pointer transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                      >
                        <td className="px-4 py-3">
                          <LoadNumberBadge>{load.number}</LoadNumberBadge>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {/* Stretched link: fills the whole row so clicking anywhere
                              in it navigates, not just this cell's text. Stays in the
                              accessible/tab order via aria-label since the visible
                              name text below it is no longer its own link. */}
                          <Link href={`/loads/${load.id}`} className="absolute inset-0" aria-label={`${load.label} bearbeiten`} />
                          {load.label}
                        </td>
                        <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{load.firearmName}</td>
                        <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{load.powder || "—"}</td>
                        <td className="px-4 py-3 text-right font-medium tabular-nums">
                          <UnitValueDisplay kind="weight" value={load.chargeGrains} />
                        </td>
                        <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">
                          {load.bulletWeightGr ? (
                            <>
                              {load.bullet}{" "}
                              <span className="tabular-nums text-neutral-400">
                                <UnitValueDisplay kind="weight" value={load.bulletWeightGr} fractionDigits={0} />
                              </span>
                            </>
                          ) : (
                            load.bullet || "—"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
