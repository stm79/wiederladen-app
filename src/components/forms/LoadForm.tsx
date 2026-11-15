"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, type FieldErrors } from "react-hook-form";
import { clsx } from "clsx";
import { zodResolver } from "@hookform/resolvers/zod";
import { loadSchema, type LoadInput } from "@/lib/validation/load";
import { createLoad, updateLoad } from "@/app/actions/loads";
import { FormActions, FormField, FormSection, inputClass, textareaClass } from "@/components/forms/FormField";
import { ComboboxInput } from "@/components/forms/ComboboxInput";
import { UnitValueInput } from "@/components/units/UnitValueInput";
import { Button } from "@/components/ui/Button";
import { toDateInputValue } from "@/lib/date-input";

const TABS = [
  { id: "overview", label: "Übersicht", fields: ["loadNumber", "variantLetter", "createdAt", "firearmId", "name"] },
  { id: "components", label: "Komponenten", fields: ["powder", "chargeGrains", "bullet", "bulletWeightGr", "primer"] },
  {
    id: "case",
    label: "Hülse",
    fields: [
      "caseBrand", "caseQuantity", "caseLoadCount", "caseTrimLengthMm", "sizingDie", "shoulderBumpMm",
      "bushingDiameterMm", "mandrelDiameterMm", "seatingDie", "oalMm", "cbtoMm", "crimpInfo",
    ],
  },
] as const satisfies readonly { id: string; label: string; fields: readonly (keyof LoadInput)[] }[];

type TabId = (typeof TABS)[number]["id"];

function tabsWithErrors(errors: FieldErrors<LoadInput>): Set<TabId> {
  return new Set(TABS.filter((t) => t.fields.some((f) => f in errors)).map((t) => t.id));
}

interface LoadFormProps {
  firearms: { id: string; name: string; caliber: string }[];
  /** Convenience default for a brand-new load: next unused number, editable. */
  suggestedLoadNumber?: number;
  knownPowders: string[];
  knownBullets: string[];
  knownPrimers: string[];
  knownSizingDies: string[];
  knownSeatingDies: string[];
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
    seatingDie: string | null;
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
  /** New loads only: values filled in from an imported file (GRT). */
  prefill?: Partial<LoadInput>;
}

export function LoadForm({
  firearms,
  suggestedLoadNumber,
  knownPowders,
  knownBullets,
  knownPrimers,
  knownSizingDies,
  knownSeatingDies,
  load,
  defaultFirearmId,
  prefill,
}: LoadFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

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
          seatingDie: "",
          primer: "",
          powder: "",
          chargeGrains: 0,
          bullet: "",
          bulletWeightGr: null,
          oalMm: null,
          cbtoMm: null,
          crimpInfo: "",
          notes: "",
          ...prefill,
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

  // All panels stay mounted (only hidden), so values entered in one tab survive
  // switching. When validation fails, jump to the first tab with an error.
  function onInvalid(errs: FieldErrors<LoadInput>) {
    const withErrors = tabsWithErrors(errs);
    if (withErrors.size > 0 && !withErrors.has(activeTab)) {
      setActiveTab(TABS.find((t) => withErrors.has(t.id))!.id);
    }
  }
  const errorTabs = tabsWithErrors(errors);

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
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="flex flex-col gap-4">
      <div
        role="tablist"
        aria-label="Ladedaten"
        className="flex gap-1 rounded-xl border border-neutral-200/80 bg-neutral-100/70 p-1 dark:border-neutral-800 dark:bg-neutral-900/60"
      >
        {TABS.map((tab) => {
          const selected = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "relative flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors",
                selected
                  ? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-white"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              )}
            >
              {tab.label}
              {errorTabs.has(tab.id) && (
                <span className="size-1.5 rounded-full bg-red-500" aria-label="enthält Fehler" />
              )}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id="panel-overview" aria-labelledby="tab-overview" hidden={activeTab !== "overview"}>
        <FormSection title="Übersicht">
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
              {!load && (
                <option value="" disabled>
                  — Waffe wählen —
                </option>
              )}
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

      </div>

      <div role="tabpanel" id="panel-components" aria-labelledby="tab-components" hidden={activeTab !== "components"}>
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

      </div>

      <div role="tabpanel" id="panel-case" aria-labelledby="tab-case" hidden={activeTab !== "case"}>
        <FormSection title="Hülse">
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
            <ComboboxInput
              id="sizingDie"
              options={knownSizingDies}
              placeholder="z.B. Redding S-Type FL"
              {...register("sizingDie")}
            />
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
          <FormField label="Setzmatrize" htmlFor="seatingDie" className="@md:col-span-2">
            <ComboboxInput
              id="seatingDie"
              options={knownSeatingDies}
              placeholder="z.B. Redding Competition Seater"
              {...register("seatingDie")}
            />
          </FormField>
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

      </div>

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
