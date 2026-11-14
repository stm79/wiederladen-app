"use client";

import { useState } from "react";
import { UnitValueDisplay } from "@/components/units/UnitValueDisplay";
import { TemperatureVelocityChart } from "@/components/charts/TemperatureVelocityChart";
import { Card, EmptyState } from "@/components/ui/Layout";
import { inputClass } from "@/components/forms/FormField";

interface LoadSessionRow {
  sessionId: string;
  date: Date;
  location: string | null;
  tempC: number | null;
  avgMps: number | null;
  sdMps: number | null;
  esMps: number | null;
  shotCount: number;
  meanExtremeSpreadMm: number | null;
}

interface LoadSessionCompareProps {
  loadOptions: { loadId: string; loadLabel: string }[];
  sessionsByLoad: Record<string, LoadSessionRow[]>;
}

const DATE_FORMAT = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });

export function LoadSessionCompare({ loadOptions, sessionsByLoad }: LoadSessionCompareProps) {
  const [selectedLoadId, setSelectedLoadId] = useState(loadOptions[0]?.loadId ?? "");
  const sessions = (sessionsByLoad[selectedLoadId] ?? []).filter((s) => s.shotCount > 0);
  const withTemp = sessions.filter((s) => s.tempC != null);

  if (loadOptions.length === 0) {
    return <p className="text-sm text-neutral-500">Noch keine Ladedaten vorhanden.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <select
        value={selectedLoadId}
        onChange={(e) => setSelectedLoadId(e.target.value)}
        aria-label="Ladung wählen"
        className={`${inputClass} sm:max-w-md`}
      >
        {loadOptions.map((l) => (
          <option key={l.loadId} value={l.loadId}>
            {l.loadLabel}
          </option>
        ))}
      </select>

      {sessions.length === 0 ? (
        <EmptyState icon="activity" title="Noch keine Chrono-Daten" description="Für diese Ladung sind noch keine Chrono-Daten aus Sessions erfasst." />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-neutral-200/80 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            <table className="w-full min-w-[560px] text-sm [&_td]:px-4 [&_td]:py-3 [&_td]:tabular-nums [&_th]:px-4 [&_th]:py-2.5 [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wide">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/80 text-left text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                  <th className="px-3 py-2 font-medium">Session</th>
                  <th className="px-3 py-2 font-medium">Temperatur</th>
                  <th className="px-3 py-2 font-medium">Ø Geschw.</th>
                  <th className="px-3 py-2 font-medium">SD</th>
                  <th className="px-3 py-2 font-medium">ES</th>
                  <th className="px-3 py-2 font-medium">Ø Gruppengröße</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.sessionId} className="border-b border-neutral-100 last:border-0 dark:border-neutral-800">
                    <td className="px-3 py-2">
                      {DATE_FORMAT.format(s.date)}
                      {s.location ? ` – ${s.location}` : ""}
                    </td>
                    <td className="px-3 py-2">{s.tempC != null ? `${s.tempC} °C` : "—"}</td>
                    <td className="px-3 py-2">
                      <UnitValueDisplay kind="velocity" value={s.avgMps} />
                    </td>
                    <td className="px-3 py-2">
                      <UnitValueDisplay kind="velocity" value={s.sdMps} />
                    </td>
                    <td className="px-3 py-2">
                      <UnitValueDisplay kind="velocity" value={s.esMps} />
                    </td>
                    <td className="px-3 py-2">
                      <UnitValueDisplay kind="length" value={s.meanExtremeSpreadMm} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {withTemp.length > 0 ? (
            <Card>
              <h3 className="mb-3 text-sm font-semibold">Temperatur vs. Ø Geschwindigkeit</h3>
              <TemperatureVelocityChart
              points={withTemp.map((s) => ({
                tempC: s.tempC!,
                avgMps: s.avgMps!,
                date: s.date,
                location: s.location,
              }))}
            />
            </Card>
          ) : (
            <p className="text-sm text-neutral-500">
              Keine der Sessions dieser Ladung hat eine Temperatur erfasst — Diagramm braucht das.
            </p>
          )}
        </>
      )}
    </div>
  );
}
