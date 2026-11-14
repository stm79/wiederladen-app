"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loadSchema, type LoadInput } from "@/lib/validation/load";
import { createLoad, updateLoad } from "@/app/actions/loads";
import { FormActions, FormField, FormSection, inputClass, textareaClass } from "@/components/forms/FormField";
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
    caseQuantity: number | null;
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
          caseQuantity: null,
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

  const numberInput = (name: "caseQuantity" | "caseLoadCount", id: string) => (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <input
          id={id}
          type="number"
          step="1"
          min="1"
          inputMode="numeric"
          className={`${inputClass} tabular-nums`}
          value={field.value ?? ""}
          onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
        />
      )}
    />
  );

  const lengthInput = (
    name: "oalMm" | "cbtoMm" | "caseTrimLengthMm" | "shoulderBumpMm" | "bushingDiameterMm" | "mandrelDiameterMm"
  ) => (
    <Controller
      control={control}
      name={name}
      render={({ field }) => <UnitValueInput id={name} kind="length" value={field.value} onChange={field.onChange} />}
    />
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FormSection title="Allgemein">
        <div className="col-span-full grid grid-cols-2 gap-4 @md:grid-cols-[8rem_8rem_1fr]">
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
                  className={`${inputClass} tabular-nums`}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                />
              )}
            />
          </FormField>
          <FormField label="Variante" htmlFor="variantLetter" error={errors.variantLetter?.message}>
            <input
              id="variantLetter"
              className={`${inputClass} uppercase`}
              maxLength={4}
              placeholder="z.B. A"
              {...register("variantLetter")}
            />
          </FormField>
          <FormField label="Erstellt am" htmlFor="createdAt" error={errors.createdAt?.message} className="col-span-2 @md:col-span-1">
            <input id="createdAt" type="date" className={inputClass} {...register("createdAt")} />
          </FormField>
        </div>

        <FormField label="Waffe" htmlFor="firearmId" error={errors.firearmId?.message}>
          <select id="firearmId" className={inputClass} {...register("firearmId")}>
            {firearms.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.caliber})
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Bezeichnung"
          htmlFor="name"
          hint="Optional — sonst automatisch aus Kaliber, Geschossgewicht und Geschoss."
        >
          <input id="name" className={inputClass} placeholder="automatisch" {...register("name")} />
        </FormField>
      </FormSection>

      <FormSection title="Komponenten">
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

        <FormField label="Zündhütchen" htmlFor="primer">
          <ComboboxInput id="primer" options={knownPrimers} placeholder="z.B. CCI BR-2" {...register("primer")} />
        </FormField>
      </FormSection>

      <FormSection title="Patrone">
        <FormField label="OAL (Gesamtlänge)" htmlFor="oalMm">
          {lengthInput("oalMm")}
        </FormField>
        <FormField label="CBTO" htmlFor="cbtoMm">
          {lengthInput("cbtoMm")}
        </FormField>
        <FormField label="Crimp" htmlFor="crimpInfo" className="@md:col-span-2">
          <input id="crimpInfo" className={inputClass} {...register("crimpInfo")} />
        </FormField>
      </FormSection>

      <FormSection title="Hülsenvorbereitung">
        <FormField label="Hülsen-Marke" htmlFor="caseBrand">
          <input id="caseBrand" className={inputClass} placeholder="z.B. Lapua" {...register("caseBrand")} />
        </FormField>
        <FormField label="Anzahl (Stück)" htmlFor="caseQuantity">
          {numberInput("caseQuantity", "caseQuantity")}
        </FormField>
        <FormField label="Load Count (Wiederladungen)" htmlFor="caseLoadCount">
          {numberInput("caseLoadCount", "caseLoadCount")}
        </FormField>
        <FormField label="Trimmlänge" htmlFor="caseTrimLengthMm">
          {lengthInput("caseTrimLengthMm")}
        </FormField>
        <FormField label="Matrize (Kalibrierung)" htmlFor="sizingDie">
          <input id="sizingDie" className={inputClass} placeholder="z.B. Redding S-Type FL" {...register("sizingDie")} />
        </FormField>
        <FormField label="Shoulder Bump" htmlFor="shoulderBumpMm">
          {lengthInput("shoulderBumpMm")}
        </FormField>
        <FormField label="Bushing (Durchmesser)" htmlFor="bushingDiameterMm">
          {lengthInput("bushingDiameterMm")}
        </FormField>
        <FormField label="Expander Mandrel (Durchmesser)" htmlFor="mandrelDiameterMm">
          {lengthInput("mandrelDiameterMm")}
        </FormField>
      </FormSection>

      <FormSection title="Notizen">
        <div className="col-span-full">
          <textarea id="notes" aria-label="Notizen" rows={3} className={textareaClass} {...register("notes")} />
        </div>
      </FormSection>

      <FormActions sticky error={serverError}>
        <Button type="submit" disabled={isSubmitting} icon="check">
          {isSubmitting ? "Speichern…" : load ? "Änderungen speichern" : "Ladung anlegen"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Abbrechen
        </Button>
      </FormActions>
    </form>
  );
}
