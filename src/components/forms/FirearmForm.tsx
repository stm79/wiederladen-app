"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { firearmSchema, type FirearmInput } from "@/lib/validation/firearm";
import { createFirearm, updateFirearm } from "@/app/actions/firearms";
import { FormActions, FormField, FormSection, inputClass, textareaClass } from "@/components/forms/FormField";
import { ComboboxInput } from "@/components/forms/ComboboxInput";
import { UnitValueInput } from "@/components/units/UnitValueInput";
import { Button } from "@/components/ui/Button";

interface FirearmFormProps {
  knownCalibers: string[];
  firearm?: {
    id: string;
    name: string;
    caliber: string;
    barrelLenMm: number | null;
    twistRate: string | null;
    notes: string | null;
  };
}

export function FirearmForm({ knownCalibers, firearm }: FirearmFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FirearmInput>({
    resolver: zodResolver(firearmSchema),
    defaultValues: firearm
      ? {
          name: firearm.name,
          caliber: firearm.caliber,
          barrelLenMm: firearm.barrelLenMm,
          twistRate: firearm.twistRate,
          notes: firearm.notes,
        }
      : {
          name: "",
          caliber: "",
          barrelLenMm: null,
          twistRate: "",
          notes: "",
        },
  });

  async function onSubmit(values: FirearmInput) {
    setServerError(null);
    try {
      if (firearm) {
        await updateFirearm(firearm.id, values);
        router.push(`/firearms/${firearm.id}`);
      } else {
        const created = await createFirearm(values);
        router.push(`/firearms/${created.id}`);
      }
      router.refresh();
    } catch {
      setServerError("Speichern fehlgeschlagen. Bitte erneut versuchen.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FormSection title="Waffe">
        <FormField label="Name" htmlFor="name" error={errors.name?.message}>
          <input id="name" className={inputClass} placeholder='z.B. "Tikka T3x"' {...register("name")} />
        </FormField>

        <FormField label="Kaliber" htmlFor="caliber" error={errors.caliber?.message}>
          <ComboboxInput
            id="caliber"
            options={knownCalibers}
            placeholder="z.B. .308 Winchester"
            {...register("caliber")}
          />
        </FormField>

        <FormField label="Lauflänge" htmlFor="barrelLenMm" error={errors.barrelLenMm?.message}>
          <Controller
            control={control}
            name="barrelLenMm"
            render={({ field }) => (
              <UnitValueInput id="barrelLenMm" kind="length" value={field.value} onChange={field.onChange} />
            )}
          />
        </FormField>

        <FormField label="Drall" htmlFor="twistRate">
          <input id="twistRate" className={inputClass} placeholder="z.B. 1:8" {...register("twistRate")} />
        </FormField>

        <FormField label="Notizen" htmlFor="notes" className="@md:col-span-2">
          <textarea id="notes" rows={3} className={textareaClass} {...register("notes")} />
        </FormField>
      </FormSection>

      <FormActions error={serverError}>
        <Button type="submit" disabled={isSubmitting} icon="check">
          {isSubmitting ? "Speichern…" : firearm ? "Änderungen speichern" : "Waffe anlegen"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Abbrechen
        </Button>
      </FormActions>
    </form>
  );
}
