"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sessionSchema, type SessionInput } from "@/lib/validation/session";
import { createSession, updateSession } from "@/app/actions/sessions";
import {
  FormActions,
  FormField,
  FormSection,
  checkboxListClass,
  checkboxRowClass,
  inputClass,
  textareaClass,
} from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import { loadDisplayName } from "@/lib/loads/label";
import { formatLoadNumber } from "@/lib/loads/variant-letter";
import { toDateInputValue } from "@/lib/date-input";

interface SessionFormProps {
  firearms: { id: string; name: string; caliber: string }[];
  loads: {
    id: string;
    loadNumber: number;
    variantLetter: string;
    name: string | null;
    firearmId: string;
    caliber: string;
    bulletWeightGr: number | null;
    bullet: string | null;
  }[];
  session?: {
    id: string;
    date: Date;
    location: string | null;
    tempC: number | null;
    pressureHPa: number | null;
    humidityPct: number | null;
    notes: string | null;
    sessionLoads: { loadId: string }[];
    sessionFirearms: { firearmId: string }[];
  };
  /** When editing inline (session detail page), cancel collapses the form
   *  instead of navigating back. */
  onCancel?: () => void;
}

export function SessionForm({ firearms, loads, session, onCancel }: SessionFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SessionInput>({
    resolver: zodResolver(sessionSchema),
    defaultValues: session
      ? {
          date: toDateInputValue(session.date),
          location: session.location,
          tempC: session.tempC,
          pressureHPa: session.pressureHPa,
          humidityPct: session.humidityPct,
          firearmIds: session.sessionFirearms.map((sf) => sf.firearmId),
          notes: session.notes,
          loadIds: session.sessionLoads.map((sl) => sl.loadId),
        }
      : {
          date: toDateInputValue(new Date()),
          location: "",
          tempC: null,
          pressureHPa: null,
          humidityPct: null,
          firearmIds: [],
          notes: "",
          loadIds: [],
        },
  });

  const selectedFirearmIds = watch("firearmIds");
  const relevantLoads =
    selectedFirearmIds.length > 0 ? loads.filter((l) => selectedFirearmIds.includes(l.firearmId)) : loads;

  async function onSubmit(values: SessionInput) {
    setServerError(null);
    try {
      if (session) {
        await updateSession(session.id, values);
        router.push(`/sessions/${session.id}`);
        onCancel?.();
      } else {
        const created = await createSession(values);
        router.push(`/sessions/${created.id}`);
      }
      router.refresh();
    } catch {
      setServerError("Speichern fehlgeschlagen. Bitte erneut versuchen.");
    }
  }

  const numberField = (name: "tempC" | "pressureHPa" | "humidityPct", suffix: string) => (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="relative">
          <input
            id={name}
            type="number"
            step="any"
            inputMode="decimal"
            className={`${inputClass} pr-12 tabular-nums`}
            value={field.value ?? ""}
            onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
          />
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-neutral-400">
            {suffix}
          </span>
        </div>
      )}
    />
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FormSection title="Wann & wo">
        <FormField label="Datum" htmlFor="date" error={errors.date?.message}>
          <input id="date" type="date" className={inputClass} {...register("date")} />
        </FormField>
        <FormField label="Ort" htmlFor="location">
          <input id="location" className={inputClass} placeholder="z.B. Schießstand, 100 m" {...register("location")} />
        </FormField>
      </FormSection>

      <FormSection title="Wetter">
        <div className="col-span-full grid grid-cols-3 gap-3 sm:gap-4">
          <FormField label="Temperatur" htmlFor="tempC">
            {numberField("tempC", "°C")}
          </FormField>
          <FormField label="Luftdruck" htmlFor="pressureHPa">
            {numberField("pressureHPa", "hPa")}
          </FormField>
          <FormField label="Feuchte" htmlFor="humidityPct" error={errors.humidityPct?.message}>
            {numberField("humidityPct", "%")}
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Waffen & Ladungen" description="Ladungen werden nach den gewählten Waffen gefiltert.">
        <FormField label="Waffen" htmlFor="firearmIds">
          {firearms.length === 0 ? (
            <p className="text-sm text-neutral-500">Noch keine Waffen angelegt.</p>
          ) : (
            <div className={checkboxListClass}>
              {firearms.map((f) => (
                <label key={f.id} className={checkboxRowClass}>
                  <input type="checkbox" value={f.id} {...register("firearmIds")} />
                  <span className="min-w-0">
                    {f.name} <span className="text-neutral-400">{f.caliber}</span>
                  </span>
                </label>
              ))}
            </div>
          )}
        </FormField>

        <FormField label="Verwendete Ladungen" htmlFor="loadIds">
          {relevantLoads.length === 0 ? (
            <p className="text-sm text-neutral-500">
              {selectedFirearmIds.length > 0 ? "Keine Ladedaten für diese Waffen." : "Noch keine Ladedaten vorhanden."}
            </p>
          ) : (
            <div className={checkboxListClass}>
              {relevantLoads.map((load) => (
                <label key={load.id} className={checkboxRowClass}>
                  <input type="checkbox" value={load.id} {...register("loadIds")} />
                  <span className="shrink-0 font-mono text-xs text-neutral-400">
                    {formatLoadNumber(load.loadNumber, load.variantLetter)}
                  </span>
                  <span className="min-w-0 truncate">{loadDisplayName(load)}</span>
                </label>
              ))}
            </div>
          )}
        </FormField>
      </FormSection>

      <FormSection title="Notizen">
        <div className="col-span-full">
          <textarea id="notes" aria-label="Notizen" rows={3} className={textareaClass} {...register("notes")} />
        </div>
      </FormSection>

      <FormActions error={serverError}>
        <Button type="submit" disabled={isSubmitting} icon="check">
          {isSubmitting ? "Speichern…" : session ? "Änderungen speichern" : "Session anlegen"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => (onCancel ? onCancel() : router.back())}>
          Abbrechen
        </Button>
      </FormActions>
    </form>
  );
}
