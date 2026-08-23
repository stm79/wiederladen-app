"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loadSchema, type LoadInput } from "@/lib/validation/load";
import { createLoad, updateLoad } from "@/app/actions/loads";
import { FormField, inputClass } from "@/components/forms/FormField";
import { ComboboxInput } from "@/components/forms/ComboboxInput";
import { UnitValueInput } from "@/components/units/UnitValueInput";
import { Button } from "@/components/ui/Button";
import { toDateInputValue } from "@/lib/date-input";

interface LoadFormProps {
  firearms: { id: string; name: string; caliber: string }[];
  /** Convenience default for a brand-new load: next unused number, editable. */
  suggestedLoadNumber?: number;
  knownPowders: string[];
  knownBullets: string[];
  knownPrimers: string[];
  load?: {
    id: string;
    loadNumber: number;
    variantLetter: string;
    name: string | null;
    createdAt: Date;
    firearmId: string;
    caseBrand: string | null;
    caseLoadCount: number | null;
    caseTrimLengthMm: number | null;
    sizingDie: string | null;
    shoulderBumpMm: number | null;
    bushingDiameterMm: number | null;
    mandrelDiameterMm: number | null;
    primer: string | null;
    powder: string | null;
    chargeGrains: number;
    bullet: string | null;
    bulletWeightGr: number | null;
    oalMm: number | null;
    cbtoMm: number | null;
    crimpInfo: string | null;
    notes: string | null;
  };
  /** Pre-select a firearm when creating a new load (e.g. coming from a firearm detail page). */
  defaultFirearmId?: string;
}

export function LoadForm({
  firearms,
  suggestedLoadNumber,
  knownPowders,
  knownBullets,
  knownPrimers,
  load,
  defaultFirearmId,
}: LoadFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LoadInput>({
    resolver: zodResolver(loadSchema),
    defaultValues: load
      ? { ...load, createdAt: toDateInputValue(load.createdAt) }
      : {
          loadNumber: suggestedLoadNumber ?? 1,
          variantLetter: "",
          name: "",
          createdAt: toDateInputValue(new Date()),
          firearmId: defaultFirearmId ?? firearms[0]?.id ?? "",
          caseBrand: "",
          caseLoadCount: null,
          caseTrimLengthMm: null,
          sizingDie: "",
          shoulderBumpMm: null,
          bushingDiameterMm: null,
          mandrelDiameterMm: null,
          primer: "",
          powder: "",
          chargeGrains: 0,
          bullet: "",
          bulletWeightGr: null,
          oalMm: null,
          cbtoMm: null,
          crimpInfo: "",
          notes: "",
        },
  });

  async function onSubmit(values: LoadInput) {
    setServerError(null);
    try {
      const result = load ? await updateLoad(load.id, values) : await createLoad(values);
      if (!result.ok) {
        setServerError(result.error);
        return;
      }
      router.push(`/loads/${result.load.id}`);
      router.refresh();
    } catch {
      setServerError("Speichern fehlgeschlagen. Bitte erneut versuchen.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-2xl flex-col gap-4">
      <div className="flex gap-4">
        <FormField label="Ladungsnummer" htmlFor="loadNumber" error={errors.loadNumber?.message}>
          <Controller
            control={control}
            name="loadNumber"
            render={({ field }) => (
              <input
                id="loadNumber"
                type="number"
                step="1"
                min="1"
                inputMode="numeric"
                className={`${inputClass} w-28`}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
              />
            )}
          />
        </FormField>
        <FormField label="Variante (optional)" htmlFor="variantLetter" error={errors.variantLetter?.message}>
          <input
            id="variantLetter"
            className={`${inputClass} w-20 uppercase`}
            maxLength={4}
            {...register("variantLetter")}
          />
        </FormField>
        <FormField label="Erstellt am" htmlFor="createdAt" error={errors.createdAt?.message}>
          <input id="createdAt" type="date" className={inputClass} {...register("createdAt")} />
        </FormField>
      </div>

      <FormField label="Bezeichnung (optional)" htmlFor="name">
        <input
          id="name"
          className={inputClass}
          placeholder="sonst automatisch: Kaliber + Geschossgewicht + Geschoss"
          {...register("name")}
        />
      </FormField>

      <FormField label="Waffe" htmlFor="firearmId" error={errors.firearmId?.message}>
        <select id="firearmId" className={inputClass} {...register("firearmId")}>
          {firearms.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name} ({f.caliber})
            </option>
          ))}
        </select>
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Zündhütchen" htmlFor="primer">
          <ComboboxInput id="primer" options={knownPrimers} placeholder="z.B. CCI BR-2" {...register("primer")} />
        </FormField>

        <FormField label="Pulver" htmlFor="powder">
          <ComboboxInput id="powder" options={knownPowders} placeholder="z.B. Vihtavuori N150" {...register("powder")} />
        </FormField>

        <FormField label="Ladungsmenge" htmlFor="chargeGrains" error={errors.chargeGrains?.message}>
          <Controller
            control={control}
            name="chargeGrains"
            render={({ field }) => (
              <UnitValueInput
                id="chargeGrains"
                kind="weight"
                value={field.value}
                onChange={(v) => field.onChange(v ?? 0)}
                required
              />
            )}
          />
        </FormField>

        <FormField label="Geschoss" htmlFor="bullet">
          <ComboboxInput id="bullet" options={knownBullets} placeholder="z.B. Sierra MatchKing" {...register("bullet")} />
        </FormField>

        <FormField label="Geschossgewicht" htmlFor="bulletWeightGr">
          <Controller
            control={control}
            name="bulletWeightGr"
            render={({ field }) => (
              <UnitValueInput id="bulletWeightGr" kind="weight" value={field.value} onChange={field.onChange} />
            )}
          />
        </FormField>

        <FormField label="OAL (Gesamtlänge)" htmlFor="oalMm">
          <Controller
            control={control}
            name="oalMm"
            render={({ field }) => (
              <UnitValueInput id="oalMm" kind="length" value={field.value} onChange={field.onChange} />
            )}
          />
        </FormField>

        <FormField label="CBTO" htmlFor="cbtoMm">
          <Controller
            control={control}
            name="cbtoMm"
            render={({ field }) => (
              <UnitValueInput id="cbtoMm" kind="length" value={field.value} onChange={field.onChange} />
            )}
          />
        </FormField>
      </div>

      <FormField label="Crimp" htmlFor="crimpInfo">
        <input id="crimpInfo" className={inputClass} {...register("crimpInfo")} />
      </FormField>

      <fieldset className="flex flex-col gap-4 rounded-md border border-neutral-200 p-4 dark:border-neutral-800">
        <legend className="px-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Hülsenvorbereitung
        </legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Hülse – Marke" htmlFor="caseBrand">
            <input id="caseBrand" className={inputClass} {...register("caseBrand")} />
          </FormField>
          <FormField label="Hülse – Load Count (Wiederladungen)" htmlFor="caseLoadCount">
            <Controller
              control={control}
              name="caseLoadCount"
              render={({ field }) => (
                <input
                  id="caseLoadCount"
                  type="number"
                  step="1"
                  min="1"
                  inputMode="numeric"
                  className={inputClass}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                />
              )}
            />
          </FormField>

          <FormField label="Hülse – Trimmlänge" htmlFor="caseTrimLengthMm">
            <Controller
              control={control}
              name="caseTrimLengthMm"
              render={({ field }) => (
                <UnitValueInput id="caseTrimLengthMm" kind="length" value={field.value} onChange={field.onChange} />
              )}
            />
          </FormField>

          <FormField label="Matrize (Kalibrierung)" htmlFor="sizingDie">
            <input
              id="sizingDie"
              className={inputClass}
              placeholder="z.B. Redding S-Type FL"
              {...register("sizingDie")}
            />
          </FormField>

          <FormField label="Shoulder Bump" htmlFor="shoulderBumpMm">
            <Controller
              control={control}
              name="shoulderBumpMm"
              render={({ field }) => (
                <UnitValueInput id="shoulderBumpMm" kind="length" value={field.value} onChange={field.onChange} />
              )}
            />
          </FormField>

          <FormField label="Bushing (Durchmesser)" htmlFor="bushingDiameterMm">
            <Controller
              control={control}
              name="bushingDiameterMm"
              render={({ field }) => (
                <UnitValueInput id="bushingDiameterMm" kind="length" value={field.value} onChange={field.onChange} />
              )}
            />
          </FormField>

          <FormField label="Expander Mandrel (Durchmesser)" htmlFor="mandrelDiameterMm">
            <Controller
              control={control}
              name="mandrelDiameterMm"
              render={({ field }) => (
                <UnitValueInput id="mandrelDiameterMm" kind="length" value={field.value} onChange={field.onChange} />
              )}
            />
          </FormField>
        </div>
      </fieldset>

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
