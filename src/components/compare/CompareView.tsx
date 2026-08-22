"use client";

import { useMemo, useState } from "react";
import type { LoadComparisonRow } from "@/lib/comparison/aggregate";
import { UnitValueDisplay } from "@/components/units/UnitValueDisplay";
import { VelocityConsistencyChart } from "@/components/charts/VelocityConsistencyChart";
import { GroupSizeComparisonChart } from "@/components/charts/GroupSizeComparisonChart";
import { LadderChart } from "@/components/charts/LadderChart";

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <label htmlFor="firearmFilter" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Waffe
        </label>
        <select
          id="firearmFilter"
          value={firearmFilter}
          onChange={(e) => changeFirearmFilter(e.target.value)}
          className="w-full max-w-xs rounded-md border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-900"
        >
          <option value={ALL_FIREARMS}>Alle Waffen</option>
          {firearms.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Ladungen auswählen</h2>
          <div className="flex gap-3 text-xs">
            <button
              type="button"
              className="text-neutral-500 underline"
              onClick={() => setSelected(new Set(visibleRows.map((r) => r.loadId)))}
            >
              Alle
            </button>
            <button type="button" className="text-neutral-500 underline" onClick={() => setSelected(new Set())}>
              Keine
            </button>
          </div>
        </div>
        <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto rounded-md border border-neutral-200 p-2 dark:border-neutral-800">
          {visibleRows.map((row) => (
            <label
              key={row.loadId}
              className="flex items-center gap-1.5 rounded-md border border-neutral-200 px-2 py-1 text-xs dark:border-neutral-800"
            >
              <input
                type="checkbox"
                checked={selected.has(row.loadId)}
                onChange={() => toggle(row.loadId)}
              />
              {row.loadLabel}
              {firearmFilter === ALL_FIREARMS && <span className="text-neutral-400">({row.firearmName})</span>}
            </label>
          ))}
        </div>
      </div>

      {selectedRows.length === 0 ? (
        <p className="text-sm text-neutral-500">Keine Ladungen ausgewählt.</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border border-neutral-200 dark:border-neutral-800">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-left dark:border-neutral-800 dark:bg-neutral-900">
                  <th className="px-3 py-2 font-medium">Ladung</th>
                  <th className="px-3 py-2 font-medium">Waffe</th>
                  <th className="px-3 py-2 font-medium">Pulver</th>
                  <th className="px-3 py-2 font-medium">Ladungsmenge</th>
                  <th className="px-3 py-2 font-medium">OAL</th>
                  <th className="px-3 py-2 font-medium">Ø Geschw.</th>
                  <th className="px-3 py-2 font-medium">SD</th>
                  <th className="px-3 py-2 font-medium">ES</th>
                  <th className="px-3 py-2 font-medium">Ø Gruppengröße</th>
                </tr>
              </thead>
              <tbody>
                {selectedRows.map((row) => (
                  <tr key={row.loadId} className="border-b border-neutral-100 dark:border-neutral-900">
                    <td className="px-3 py-2 font-medium">{row.loadLabel}</td>
                    <td className="px-3 py-2 text-neutral-500">{row.firearmName}</td>
                    <td className="px-3 py-2 text-neutral-500">{row.powder ?? "—"}</td>
                    <td className="px-3 py-2">
                      <UnitValueDisplay kind="weight" value={row.chargeGrains} />
                    </td>
                    <td className="px-3 py-2">
                      <UnitValueDisplay kind="length" value={row.oalMm} />
                    </td>
                    <td className="px-3 py-2">
                      <UnitValueDisplay kind="velocity" value={row.avgMps} />
                    </td>
                    <td className="px-3 py-2">
                      <UnitValueDisplay kind="velocity" value={row.sdMps} />
                    </td>
                    <td className="px-3 py-2">
                      <UnitValueDisplay kind="velocity" value={row.esMps} />
                    </td>
                    <td className="px-3 py-2">
                      <UnitValueDisplay kind="length" value={row.meanExtremeSpreadMm} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold">Konsistenz (SD / Extreme Spread)</h2>
            <VelocityConsistencyChart
              points={selectedRows.map((r) => ({ loadLabel: r.loadLabel, sdMps: r.sdMps, esMps: r.esMps }))}
            />
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold">Mittlere Gruppengröße</h2>
            <GroupSizeComparisonChart
              points={selectedRows.map((r) => ({ loadLabel: r.loadLabel, meanExtremeSpreadMm: r.meanExtremeSpreadMm }))}
            />
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold">Ladeleiter (Ø Geschwindigkeit je Ladungsmenge)</h2>
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
          </div>
        </>
      )}
    </div>
  );
}
