"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { shotGroupManualSchema, type ShotGroupManualInput } from "@/lib/validation/shotgroup";
import { createShotGroup, updateShotGroupManual } from "@/app/actions/groups";
import { FormActions, FormField, inputClass, textareaClass } from "@/components/forms/FormField";
import { UnitValueInput } from "@/components/units/UnitValueInput";
import { Button } from "@/components/ui/Button";
import { loadDisplayName } from "@/lib/loads/label";
import { formatLoadNumber } from "@/lib/loads/variant-letter";

export interface ShotGroupLoadOption {
  id: string;
  loadNumber: number;
  variantLetter: string;
  name: string | null;
  caliber: string;
  bulletWeightGr: number | null;
  bullet: string | null;
}

interface ShotGroupFormProps {
  sessionId: string;
  loads: ShotGroupLoadOption[];
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

  const plainNumber = (name: "distanceM" | "shotCount", step: string, suffix?: string) => (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="relative">
          <input
            id={name}
            type="number"
            step={step}
            inputMode={step === "1" ? "numeric" : "decimal"}
            className={`${inputClass} tabular-nums ${suffix ? "pr-10" : ""}`}
            value={field.value ?? ""}
            onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
          />
          {suffix && (
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-neutral-400">
              {suffix}
            </span>
          )}
        </div>
      )}
    />
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 rounded-xl border border-brand/40 bg-white p-4 shadow-sm ring-3 ring-brand/10 sm:p-5 dark:bg-neutral-900"
    >
      <h3 className="text-sm font-semibold">{group ? "Schussgruppe bearbeiten" : "Neue Schussgruppe"}</h3>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Ladung" htmlFor="loadId" className="col-span-2">
          <select id="loadId" className={inputClass} {...register("loadId")}>
            <option value="">— keine —</option>
            {loads.map((load) => (
              <option key={load.id} value={load.id}>
                {formatLoadNumber(load.loadNumber, load.variantLetter)} · {loadDisplayName(load)}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Distanz" htmlFor="distanceM">
          {plainNumber("distanceM", "any", "m")}
        </FormField>

        <FormField label="Anzahl Schuss" htmlFor="shotCount">
          {plainNumber("shotCount", "1")}
        </FormField>

        <FormField label="Extreme Spread" htmlFor="extremeSpreadMm" hint="manuell, oder per Foto vermessen" className="col-span-2 sm:col-span-1">
          <Controller
            control={control}
            name="extremeSpreadMm"
            render={({ field }) => (
              <UnitValueInput id="extremeSpreadMm" kind="length" value={field.value} onChange={field.onChange} />
            )}
          />
        </FormField>

        <FormField label="Mean Radius" htmlFor="meanRadiusMm" className="col-span-2 sm:col-span-1">
          <Controller
            control={control}
            name="meanRadiusMm"
            render={({ field }) => (
              <UnitValueInput id="meanRadiusMm" kind="length" value={field.value} onChange={field.onChange} />
            )}
          />
        </FormField>

        <FormField label="Notizen" htmlFor="notes" className="col-span-2">
          <textarea id="notes" rows={2} className={textareaClass} {...register("notes")} />
        </FormField>
      </div>

      <FormActions error={serverError}>
        <Button type="submit" disabled={isSubmitting} icon="check">
          {isSubmitting ? "Speichern…" : "Speichern"}
        </Button>
        {onDone && (
          <Button type="button" variant="ghost" onClick={onDone}>
            Abbrechen
          </Button>
        )}
      </FormActions>
    </form>
  );
}
