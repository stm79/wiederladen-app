"use client";

import { useMemo, useState } from "react";
import type { LoadComparisonRow } from "@/lib/comparison/aggregate";
import { UnitValueDisplay } from "@/components/units/UnitValueDisplay";
import { VelocityConsistencyChart } from "@/components/charts/VelocityConsistencyChart";
import { GroupSizeComparisonChart } from "@/components/charts/GroupSizeComparisonChart";
import { LadderChart } from "@/components/charts/LadderChart";
import Link from "next/link";
import { clsx } from "clsx";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Card, EmptyState } from "@/components/ui/Layout";
import { inputClass } from "@/components/forms/FormField";

const ALL_FIREARMS = "__all__";

export function CompareView({ rows }: { rows: LoadComparisonRow[] }) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(rows.map((r) => r.loadId)));
  const [firearmFilter, setFirearmFilter] = useState<string>(ALL_FIREARMS);

  const firearms = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of rows) map.set(r.firearmId, r.firearmName);
    return Array.from(map, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [rows]);

  const visibleRows = useMemo(
    () => (firearmFilter === ALL_FIREARMS ? rows : rows.filter((r) => r.firearmId === firearmFilter)),
    [rows, firearmFilter]
  );

  const selectedRows = useMemo(() => visibleRows.filter((r) => selected.has(r.loadId)), [visibleRows, selected]);

  function toggle(loadId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(loadId)) next.delete(loadId);
      else next.add(loadId);
      return next;
    });
  }

  function changeFirearmFilter(firearmId: string) {
    setFirearmFilter(firearmId);
    const scoped = firearmId === ALL_FIREARMS ? rows : rows.filter((r) => r.firearmId === firearmId);
    setSelected(new Set(scoped.map((r) => r.loadId)));
  }

  const th = "px-4 py-2.5 text-xs font-medium uppercase tracking-wide whitespace-nowrap";
  const td = "px-4 py-3 whitespace-nowrap tabular-nums";

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="firearmFilter" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Waffe
            </label>
            <select
              id="firearmFilter"
              value={firearmFilter}
              onChange={(e) => changeFirearmFilter(e.target.value)}
              className={`${inputClass} sm:w-64`}
            >
              <option value={ALL_FIREARMS}>Alle Waffen</option>
              {firearms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <span className="mr-1 text-neutral-500">
              {selectedRows.length} von {visibleRows.length} gewählt
            </span>
            <Button type="button" variant="ghost" size="sm" onClick={() => setSelected(new Set(visibleRows.map((r) => r.loadId)))}>
              Alle
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
              Keine
            </Button>
          </div>
        </div>
        <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto">
          {visibleRows.map((row) => {
            const on = selected.has(row.loadId);
            return (
              <button
                key={row.loadId}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(row.loadId)}
                className={clsx(
                  "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-left text-xs font-medium transition-colors",
                  on
                    ? "border-brand/50 bg-brand-soft text-neutral-900 dark:text-white"
                    : "border-neutral-200 text-neutral-500 hover:border-neutral-300 dark:border-neutral-700 dark:text-neutral-400"
                )}
              >
                <Icon name="check" size={13} className={on ? "text-brand" : "opacity-0"} />
                {row.loadLabel}
                {firearmFilter === ALL_FIREARMS && <span className="font-normal text-neutral-400">· {row.firearmName}</span>}
              </button>
            );
          })}
        </div>
      </Card>

      {selectedRows.length === 0 ? (
        <EmptyState icon="chart" title="Keine Ladungen ausgewählt" description="Wähle oben mindestens eine Ladung aus." />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-neutral-200/80 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/80 text-left text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                  <th className={th}>Ladung</th>
                  <th className={th}>Waffe</th>
                  <th className={th}>Pulver</th>
                  <th className={`${th} text-right`}>Menge</th>
                  <th className={`${th} text-right`}>OAL</th>
                  <th className={`${th} text-right`}>Ø Geschw.</th>
                  <th className={`${th} text-right`}>SD</th>
                  <th className={`${th} text-right`}>ES</th>
                  <th className={`${th} text-right`}>Ø Gruppe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {selectedRows.map((row) => (
                  <tr key={row.loadId} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="whitespace-nowrap px-4 py-3 font-medium">
                      <Link href={`/loads/${row.loadId}`} className="hover:underline">
                        {row.loadLabel}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-neutral-500">{row.firearmName}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-neutral-500">{row.powder ?? "—"}</td>
                    <td className={`${td} text-right`}>
                      <UnitValueDisplay kind="weight" value={row.chargeGrains} />
                    </td>
                    <td className={`${td} text-right`}>
                      <UnitValueDisplay kind="length" value={row.oalMm} />
                    </td>
                    <td className={`${td} text-right font-medium`}>
                      <UnitValueDisplay kind="velocity" value={row.avgMps} fractionDigits={1} />
                    </td>
                    <td className={`${td} text-right`}>
                      <UnitValueDisplay kind="velocity" value={row.sdMps} fractionDigits={1} />
                    </td>
                    <td className={`${td} text-right`}>
                      <UnitValueDisplay kind="velocity" value={row.esMps} fractionDigits={1} />
                    </td>
                    <td className={`${td} text-right`}>
                      <UnitValueDisplay kind="length" value={row.meanExtremeSpreadMm} fractionDigits={1} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <h3 className="mb-3 text-sm font-semibold">Konsistenz (SD / Extreme Spread)</h3>
              <VelocityConsistencyChart
                points={selectedRows.map((r) => ({ loadLabel: r.loadNumberLabel, sdMps: r.sdMps, esMps: r.esMps }))}
              />
            </Card>

            <Card>
              <h3 className="mb-3 text-sm font-semibold">Mittlere Gruppengröße</h3>
              <GroupSizeComparisonChart
                points={selectedRows.map((r) => ({ loadLabel: r.loadNumberLabel, meanExtremeSpreadMm: r.meanExtremeSpreadMm }))}
              />
            </Card>
          </div>

          <Card>
            <h3 className="mb-3 text-sm font-semibold">Ladeleiter (Ø Geschwindigkeit je Ladungsmenge)</h3>
            <LadderChart
              points={selectedRows
                .filter((r) => r.avgMps != null)
                .map((r) => ({
                  seriesKey: r.powder ?? r.loadLabel,
                  seriesLabel: r.powder ?? r.loadLabel,
                  chargeGrains: r.chargeGrains,
                  velocityMps: r.avgMps!,
                }))}
            />
          </Card>
        </>
      )}
    </div>
  );
}
