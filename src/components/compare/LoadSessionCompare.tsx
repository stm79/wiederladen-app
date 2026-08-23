"use client";

import { useState } from "react";
import { UnitValueDisplay } from "@/components/units/UnitValueDisplay";
import { TemperatureVelocityChart } from "@/components/charts/TemperatureVelocityChart";

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

const DATE_FORMAT = new Intl.DateTimeFormat("de-DE");

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
        className="w-full max-w-md rounded-md border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-900"
      >
        {loadOptions.map((l) => (
          <option key={l.loadId} value={l.loadId}>
            {l.loadLabel}
          </option>
        ))}
      </select>

      {sessions.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Für diese Ladung sind noch keine Chrono-Daten aus Sessions erfasst.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border border-neutral-200 dark:border-neutral-800">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-left dark:border-neutral-800 dark:bg-neutral-900">
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
                  <tr key={s.sessionId} className="border-b border-neutral-100 dark:border-neutral-900">
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
            <TemperatureVelocityChart
              points={withTemp.map((s) => ({
                tempC: s.tempC!,
                avgMps: s.avgMps!,
                date: s.date,
                location: s.location,
              }))}
            />
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
