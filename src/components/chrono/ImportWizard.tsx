"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { applyMapping } from "@/lib/chrono-import/apply-mapping";
import { computeVelocityStats } from "@/lib/stats/velocity-stats";
import type { ColumnMapping, DetectedFormat, SeriesOption } from "@/lib/chrono-import/types";
import { parseChronoFile, commitVelocityImport } from "@/app/actions/chrono";
import { UnitValueDisplay } from "@/components/units/UnitValueDisplay";
import { FormField, inputClass } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";

interface ImportWizardProps {
  groupId: string;
  sessionId: string;
}

const NONE_COLUMN = "__none__";

export function ImportWizard({ groupId, sessionId }: ImportWizardProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [detected, setDetected] = useState<DetectedFormat | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<SeriesOption | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping | null>(null);
  const [sourceDevice, setSourceDevice] = useState("Generisches CSV/Excel");
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setDetected(null);
    setSelectedSeries(null);
    setMapping(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function chooseSeries(series: SeriesOption) {
    setSelectedSeries(series);
    setMapping(series.suggestedMapping ?? { shotNumberColumn: null, velocityColumn: 0, velocityUnit: "mps" });
  }

  async function handleFile(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setIsParsing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const result = await parseChronoFile(formData);
      setDetected(result.detected);
      setFileName(result.fileName);
      setSourceDevice(result.detected.label);
      if (result.detected.series.length === 1) {
        chooseSeries(result.detected.series[0]);
      }
    } catch {
      setError("Datei konnte nicht gelesen werden.");
    } finally {
      setIsParsing(false);
    }
  }

  const shots = useMemo(
    () => (selectedSeries && mapping ? applyMapping(selectedSeries.table, mapping) : []),
    [selectedSeries, mapping]
  );
  const stats = useMemo(() => computeVelocityStats(shots.map((s) => s.velocityMps)), [shots]);

  async function handleCommit() {
    if (!mapping || shots.length === 0) return;
    setIsSaving(true);
    setError(null);
    try {
      await commitVelocityImport({
        groupId,
        sourceDevice,
        rawFileName: fileName,
        shots,
      });
      router.push(`/sessions/${sessionId}`);
      router.refresh();
    } catch {
      setError("Import fehlgeschlagen.");
      setIsSaving(false);
    }
  }

  if (!detected) {
    return (
      <div className="flex flex-col gap-3">
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls,text/csv"
          disabled={isParsing}
          onChange={(e) => handleFile(e.target.files)}
          className="text-sm text-neutral-600 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-900 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white dark:text-neutral-400 dark:file:bg-neutral-100 dark:file:text-neutral-900"
        />
        {isParsing && <span className="text-sm text-neutral-400">Datei wird gelesen…</span>}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    );
  }

  if (!selectedSeries || !mapping) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-md border border-neutral-200 p-3 text-sm dark:border-neutral-800">
          Format erkannt: <strong>{detected.label}</strong> — diese Datei enthält mehrere Serien. Welche soll
          importiert werden?
        </div>
        <div className="flex flex-col divide-y divide-neutral-200 rounded-md border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
          {detected.series.map((series) => (
            <button
              key={series.id}
              type="button"
              onClick={() => chooseSeries(series)}
              className="px-4 py-2 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900"
            >
              {series.label}
            </button>
          ))}
        </div>
        <Button type="button" variant="secondary" onClick={reset} className="self-start">
          Andere Datei wählen
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-md border border-neutral-200 p-3 text-sm dark:border-neutral-800">
        {detected.confidence === "high" ? (
          <span>
            Format erkannt: <strong>{detected.label}</strong> — bitte Spaltenzuordnung trotzdem prüfen.
          </span>
        ) : selectedSeries.suggestedMapping ? (
          <span>Keine bekannte Marke erkannt — Vorschlag für die Spaltenzuordnung unten, bitte prüfen.</span>
        ) : (
          <span>Konnte keine Geschwindigkeits-Spalte erraten — bitte manuell zuordnen.</span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FormField label="Schuss-Nr.-Spalte" htmlFor="shotCol">
          <select
            id="shotCol"
            className={inputClass}
            value={mapping.shotNumberColumn ?? NONE_COLUMN}
            onChange={(e) =>
              setMapping({
                ...mapping,
                shotNumberColumn: e.target.value === NONE_COLUMN ? null : Number(e.target.value),
              })
            }
          >
            <option value={NONE_COLUMN}>— automatisch nummerieren —</option>
            {selectedSeries.table.headers.map((h, i) => (
              <option key={i} value={i}>
                {h || `Spalte ${i + 1}`}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Geschwindigkeits-Spalte" htmlFor="velCol">
          <select
            id="velCol"
            className={inputClass}
            value={mapping.velocityColumn}
            onChange={(e) => setMapping({ ...mapping, velocityColumn: Number(e.target.value) })}
          >
            {selectedSeries.table.headers.map((h, i) => (
              <option key={i} value={i}>
                {h || `Spalte ${i + 1}`}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Einheit in der Datei" htmlFor="velUnit">
          <select
            id="velUnit"
            className={inputClass}
            value={mapping.velocityUnit}
            onChange={(e) => setMapping({ ...mapping, velocityUnit: e.target.value as "mps" | "fps" })}
          >
            <option value="mps">m/s</option>
            <option value="fps">fps</option>
          </select>
        </FormField>
      </div>

      <div className="overflow-x-auto rounded-md border border-neutral-200 dark:border-neutral-800">
        <table className="w-full min-w-[400px] text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left dark:border-neutral-800 dark:bg-neutral-900">
              {selectedSeries.table.headers.map((h, i) => (
                <th key={i} className="px-3 py-1.5 font-medium">
                  {h || `Spalte ${i + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {selectedSeries.table.rows.slice(0, 10).map((row, i) => (
              <tr key={i} className="border-b border-neutral-100 dark:border-neutral-900">
                {row.map((cell, j) => (
                  <td key={j} className="px-3 py-1.5 text-neutral-600 dark:text-neutral-400">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {selectedSeries.table.rows.length > 10 && (
          <div className="px-3 py-1.5 text-xs text-neutral-400">
            … und {selectedSeries.table.rows.length - 10} weitere Zeilen
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-6 text-sm">
        <span>{shots.length} gültige Schuss erkannt</span>
        <div>
          <span className="text-neutral-500">Ø </span>
          <UnitValueDisplay kind="velocity" value={stats?.avgMps ?? null} />
        </div>
        <div>
          <span className="text-neutral-500">SD </span>
          <UnitValueDisplay kind="velocity" value={stats?.sdMps ?? null} />
        </div>
        <div>
          <span className="text-neutral-500">ES </span>
          <UnitValueDisplay kind="velocity" value={stats?.esMps ?? null} />
        </div>
      </div>

      <FormField label="Quelle / Gerät" htmlFor="sourceDevice">
        <input
          id="sourceDevice"
          className={inputClass}
          value={sourceDevice}
          onChange={(e) => setSourceDevice(e.target.value)}
        />
      </FormField>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <Button type="button" disabled={shots.length === 0 || isSaving} onClick={handleCommit}>
          {isSaving ? "Importieren…" : `${shots.length} Schuss importieren`}
        </Button>
        <Button type="button" variant="secondary" onClick={reset}>
          Andere Datei wählen
        </Button>
      </div>
    </div>
  );
}
