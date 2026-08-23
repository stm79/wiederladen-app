"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sessionSchema, type SessionInput } from "@/lib/validation/session";
import { createSession, updateSession } from "@/app/actions/sessions";
import { FormField, inputClass } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import { loadDisplayName } from "@/lib/loads/label";

interface SessionFormProps {
  firearms: { id: string; name: string; caliber: string }[];
  loads: {
    id: string;
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
}

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function SessionForm({ firearms, loads, session }: SessionFormProps) {
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
      } else {
        const created = await createSession(values);
        router.push(`/sessions/${created.id}`);
      }
      router.refresh();
    } catch {
      setServerError("Speichern fehlgeschlagen. Bitte erneut versuchen.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-2xl flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Datum" htmlFor="date" error={errors.date?.message}>
          <input id="date" type="date" className={inputClass} {...register("date")} />
        </FormField>

        <FormField label="Ort" htmlFor="location">
          <input id="location" className={inputClass} {...register("location")} />
        </FormField>

        <FormField label="Temperatur (°C)" htmlFor="tempC">
          <Controller
            control={control}
            name="tempC"
            render={({ field }) => (
              <input
                id="tempC"
                type="number"
                step="any"
                inputMode="decimal"
                className={inputClass}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
              />
            )}
          />
        </FormField>

        <FormField label="Luftdruck (hPa)" htmlFor="pressureHPa">
          <Controller
            control={control}
            name="pressureHPa"
            render={({ field }) => (
              <input
                id="pressureHPa"
                type="number"
                step="any"
                inputMode="decimal"
                className={inputClass}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
              />
            )}
          />
        </FormField>

        <FormField label="Luftfeuchtigkeit (%)" htmlFor="humidityPct" error={errors.humidityPct?.message}>
          <Controller
            control={control}
            name="humidityPct"
            render={({ field }) => (
              <input
                id="humidityPct"
                type="number"
                step="any"
                inputMode="decimal"
                className={inputClass}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
              />
            )}
          />
        </FormField>
      </div>

      <FormField label="Waffen (optional)" htmlFor="firearmIds">
        {firearms.length === 0 ? (
          <p className="text-sm text-neutral-500">Noch keine Waffen angelegt.</p>
        ) : (
          <div className="flex max-h-48 flex-col gap-1 overflow-y-auto rounded-md border border-neutral-300 p-2 dark:border-neutral-700">
            {firearms.map((f) => (
              <label key={f.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" value={f.id} {...register("firearmIds")} />
                {f.name} ({f.caliber})
              </label>
            ))}
          </div>
        )}
      </FormField>

      <FormField label="Verwendete Ladedaten" htmlFor="loadIds">
        {relevantLoads.length === 0 ? (
          <p className="text-sm text-neutral-500">
            {selectedFirearmIds.length > 0 ? "Keine Ladedaten für diese Waffen." : "Noch keine Ladedaten vorhanden."}
          </p>
        ) : (
          <div className="flex max-h-48 flex-col gap-1 overflow-y-auto rounded-md border border-neutral-300 p-2 dark:border-neutral-700">
            {relevantLoads.map((load) => (
              <label key={load.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" value={load.id} {...register("loadIds")} />
                {loadDisplayName(load)}
              </label>
            ))}
          </div>
        )}
      </FormField>

      <FormField label="Notizen" htmlFor="notes">
        <textarea id="notes" rows={3} className={inputClass} {...register("notes")} />
      </FormField>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Speichern…" : "Speichern"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Abbrechen
        </Button>
      </div>
    </form>
  );
}
