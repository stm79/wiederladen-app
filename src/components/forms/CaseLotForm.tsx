"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { caseLotSchema, type CaseLotInput } from "@/lib/validation/case-lot";
import { createCaseLot, updateCaseLot } from "@/app/actions/case-lots";
import { FormActions, FormField, FormSection, inputClass, textareaClass } from "@/components/forms/FormField";
import { ComboboxInput } from "@/components/forms/ComboboxInput";
import { Button } from "@/components/ui/Button";
import { toDateInputValue } from "@/lib/date-input";

interface CaseLotFormProps {
  knownCalibers: string[];
  lot?: {
    id: string;
    name: string;
    brand: string | null;
    caliber: string | null;
    quantity: number | null;
    purchasedAt: Date | null;
    retired: boolean;
    notes: string | null;
  };
}

export function CaseLotForm({ knownCalibers, lot }: CaseLotFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CaseLotInput>({
    resolver: zodResolver(caseLotSchema),
    defaultValues: lot
      ? {
          name: lot.name,
          brand: lot.brand ?? "",
          caliber: lot.caliber ?? "",
          quantity: lot.quantity,
          purchasedAt: lot.purchasedAt ? toDateInputValue(lot.purchasedAt) : "",
          retired: lot.retired,
          notes: lot.notes ?? "",
        }
      : { name: "", brand: "", caliber: "", quantity: null, purchasedAt: "", retired: false, notes: "" },
  });

  async function onSubmit(values: CaseLotInput) {
    setServerError(null);
    try {
      const result = lot ? await updateCaseLot(lot.id, values) : await createCaseLot(values);
      if (!result.ok) {
        setServerError(result.error);
        return;
      }
      router.push(`/cases/${result.lot.id}`);
      router.refresh();
    } catch {
      setServerError("Speichern fehlgeschlagen. Bitte erneut versuchen.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FormSection title="Hülsen-Charge">
        <FormField label="Name" htmlFor="name" error={errors.name?.message} className="@md:col-span-2">
          <input id="name" className={inputClass} placeholder="z.B. Lapua Match 2025" {...register("name")} />
        </FormField>

        <FormField label="Marke" htmlFor="brand">
          <input id="brand" className={inputClass} placeholder="z.B. Lapua" {...register("brand")} />
        </FormField>

        <FormField label="Kaliber" htmlFor="caliber">
          <ComboboxInput id="caliber" options={knownCalibers} placeholder="z.B. .308 Winchester" {...register("caliber")} />
        </FormField>

        <FormField label="Anzahl (Stück)" htmlFor="quantity" error={errors.quantity?.message}>
          <Controller
            control={control}
            name="quantity"
            render={({ field }) => (
              <input
                id="quantity"
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
        </FormField>

        <FormField label="Gekauft am" htmlFor="purchasedAt">
          <input id="purchasedAt" type="date" className={inputClass} {...register("purchasedAt")} />
        </FormField>

        <FormField label="Notizen" htmlFor="notes" className="@md:col-span-2">
          <textarea
            id="notes"
            rows={3}
            className={textareaClass}
            placeholder="z.B. geglüht nach 3. Ladung, 4 Stück aussortiert"
            {...register("notes")}
          />
        </FormField>

        {lot && (
          <label className="col-span-full flex items-center gap-2.5 text-sm">
            <input type="checkbox" className="size-4" {...register("retired")} />
            Ausgemustert — nicht mehr in der Auswahl bei neuen Ladungen
          </label>
        )}
      </FormSection>

      <FormActions error={serverError}>
        <Button type="submit" disabled={isSubmitting} icon="check">
          {isSubmitting ? "Speichern…" : lot ? "Änderungen speichern" : "Charge anlegen"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Abbrechen
        </Button>
      </FormActions>
    </form>
  );
}
