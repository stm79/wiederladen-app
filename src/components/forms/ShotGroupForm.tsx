"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { shotGroupManualSchema, type ShotGroupManualInput } from "@/lib/validation/shotgroup";
import { createShotGroup, updateShotGroupManual } from "@/app/actions/groups";
import { FormField, inputClass } from "@/components/forms/FormField";
import { UnitValueInput } from "@/components/units/UnitValueInput";
import { Button } from "@/components/ui/Button";
import { loadDisplayName } from "@/lib/loads/label";

interface ShotGroupFormProps {
  sessionId: string;
  loads: { id: string; name: string | null; caliber: string; bulletWeightGr: number | null; bullet: string | null }[];
  group?: {
    id: string;
    loadId: string | null;
    distanceM: number | null;
    extremeSpreadMm: number | null;
    meanRadiusMm: number | null;
    shotCount: number | null;
    notes: string | null;
  };
  onDone?: () => void;
}

export function ShotGroupForm({ sessionId, loads, group, onDone }: ShotGroupFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<ShotGroupManualInput>({
    resolver: zodResolver(shotGroupManualSchema),
    defaultValues: group
      ? { sessionId, ...group }
      : {
          sessionId,
          loadId: loads[0]?.id ?? null,
          distanceM: null,
          extremeSpreadMm: null,
          meanRadiusMm: null,
          shotCount: null,
          notes: "",
        },
  });

  async function onSubmit(values: ShotGroupManualInput) {
    setServerError(null);
    try {
      if (group) {
        await updateShotGroupManual(group.id, values);
      } else {
        await createShotGroup(values);
      }
      router.refresh();
      onDone?.();
    } catch {
      setServerError("Speichern fehlgeschlagen.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 rounded-md border border-neutral-200 p-4 dark:border-neutral-800">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField label="Ladung" htmlFor="loadId">
          <select id="loadId" className={inputClass} {...register("loadId")}>
            <option value="">— keine —</option>
            {loads.map((load) => (
              <option key={load.id} value={load.id}>
                {loadDisplayName(load)}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Distanz (m)" htmlFor="distanceM">
          <Controller
            control={control}
            name="distanceM"
            render={({ field }) => (
              <input
                id="distanceM"
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

        <FormField label="Extreme Spread (manuell)" htmlFor="extremeSpreadMm">
          <Controller
            control={control}
            name="extremeSpreadMm"
            render={({ field }) => (
              <UnitValueInput id="extremeSpreadMm" kind="length" value={field.value} onChange={field.onChange} />
            )}
          />
        </FormField>

        <FormField label="Mean Radius (manuell)" htmlFor="meanRadiusMm">
          <Controller
            control={control}
            name="meanRadiusMm"
            render={({ field }) => (
              <UnitValueInput id="meanRadiusMm" kind="length" value={field.value} onChange={field.onChange} />
            )}
          />
        </FormField>

        <FormField label="Anzahl Schuss" htmlFor="shotCount">
          <Controller
            control={control}
            name="shotCount"
            render={({ field }) => (
              <input
                id="shotCount"
                type="number"
                step="1"
                inputMode="numeric"
                className={inputClass}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
              />
            )}
          />
        </FormField>
      </div>

      <FormField label="Notizen" htmlFor="notes">
        <textarea id="notes" rows={2} className={inputClass} {...register("notes")} />
      </FormField>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Speichern…" : "Speichern"}
        </Button>
        {onDone && (
          <Button type="button" variant="secondary" onClick={onDone}>
            Abbrechen
          </Button>
        )}
      </div>
    </form>
  );
}
