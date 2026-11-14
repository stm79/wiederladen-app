"use client";

import { useRef, useState } from "react";
import { LoadForm } from "@/components/forms/LoadForm";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { grtLoadData, parseGrtFile, type GrtLoadData } from "@/lib/grt/parse";
import { grtToLoadPrefill, type FirearmMatch, type FirearmOption, type GrtLoadPrefill } from "@/lib/grt/to-load";

interface NewLoadFormProps {
  firearms: FirearmOption[];
  defaultFirearmId?: string;
  suggestedLoadNumber: number;
  knownPowders: string[];
  knownBullets: string[];
  knownPrimers: string[];
}

interface Imported {
  fileName: string;
  data: GrtLoadData;
  prefill: GrtLoadPrefill;
  firearm: FirearmMatch | null;
}

/** New-load form with an optional "fill from GRT file" step on top. An
 *  import remounts the form with the imported values as its defaults, so
 *  every field (including the unit inputs) shows them and stays editable. */
export function NewLoadForm(props: NewLoadFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [imported, setImported] = useState<Imported | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);

  async function handleFile(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setIsReading(true);
    setError(null);
    try {
      const data = grtLoadData(parseGrtFile(await file.text()));
      const { prefill, firearm } = grtToLoadPrefill(data, {
        fileName: file.name,
        firearms: props.firearms,
        knownPowders: props.knownPowders,
        knownBullets: props.knownBullets,
      });
      setImported({ fileName: file.name, data, prefill, firearm });
      setFormKey((k) => k + 1);
    } catch {
      setError("Datei konnte nicht gelesen werden — ist das eine .grtload-Datei aus Gordon's Reloading Tool?");
    } finally {
      setIsReading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function clear() {
    setImported(null);
    setFormKey((k) => k + 1);
  }

  const missing = imported
    ? [
        !imported.data.powder && "Pulver",
        !imported.data.chargeGrains && "Ladungsmenge",
        !imported.data.bullet && "Geschoss",
        !imported.data.oalMm && "OAL",
      ].filter(Boolean)
    : [];

  return (
    <div className="flex flex-col gap-4">
      {imported ? (
        <div className="flex flex-col gap-2 rounded-xl border border-brand/30 bg-brand-soft/60 p-3 text-sm sm:p-4">
          <div className="flex items-start gap-2">
            <Icon name="check" size={16} className="mt-0.5 shrink-0 text-emerald-700 dark:text-emerald-400" />
            <div className="min-w-0 flex-1">
              <div className="font-medium">Aus GRT übernommen — bitte prüfen und speichern</div>
              <div className="truncate text-xs text-neutral-500 dark:text-neutral-400">{imported.fileName}</div>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={clear}>
              Verwerfen
            </Button>
          </div>
          <ul className="flex flex-col gap-1 pl-6 text-neutral-700 dark:text-neutral-300">
            <li>
              {imported.firearm ? (
                <>
                  Waffe: <strong>{imported.firearm.firearm.name}</strong>
                  {imported.firearm.by === "caliber" ? ` (nach Kaliber ${imported.firearm.firearm.caliber})` : ""}
                </>
              ) : (
                <span className="text-amber-800 dark:text-amber-300">
                  Waffe nicht eindeutig erkannt
                  {imported.data.caliberName ? ` (Kaliber in GRT: ${imported.data.caliberName})` : ""} — bitte
                  unten auswählen.
                </span>
              )}
            </li>
            {missing.length > 0 && (
              <li className="text-amber-800 dark:text-amber-300">Nicht in der Datei: {missing.join(", ")}</li>
            )}
            <li className="text-neutral-500 dark:text-neutral-400">
              Pulver-Los, Lauf und Hülsendaten stehen in den Notizen.
            </li>
          </ul>
        </div>
      ) : (
        <label
          className={`flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-neutral-300 bg-white px-4 py-3 text-sm transition-colors hover:border-brand hover:bg-brand-soft/40 dark:border-neutral-700 dark:bg-neutral-900 ${isReading ? "pointer-events-none opacity-60" : ""}`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800">
            <Icon name="upload" size={18} />
          </span>
          <span className="min-w-0">
            <span className="block font-medium">{isReading ? "Datei wird gelesen…" : "Aus GRT-Datei übernehmen"}</span>
            <span className="block text-xs text-neutral-500 dark:text-neutral-400">
              .grtload aus Gordon&apos;s Reloading Tool — füllt Pulver, Ladung, Geschoss und OAL aus
            </span>
          </span>
          <input
            ref={inputRef}
            type="file"
            accept=".grtload,.xml"
            disabled={isReading}
            onChange={(e) => handleFile(e.target.files)}
            className="sr-only"
          />
        </label>
      )}
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <LoadForm key={formKey} {...props} prefill={imported?.prefill} />
    </div>
  );
}
