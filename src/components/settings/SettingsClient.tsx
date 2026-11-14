"use client";

import { useTheme } from "next-themes";
import { useUnits } from "@/components/units/UnitProvider";
import type { LengthUnit, VelocityUnit, WeightUnit } from "@/lib/units/types";
import { RestoreBackupForm } from "@/components/settings/RestoreBackupForm";
import { ChecklistStepsManager } from "@/components/settings/ChecklistStepsManager";
import { APP_VERSION } from "@/lib/version";
import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Card, PageHeader, Section } from "@/components/ui/Layout";

function Segmented<T extends string>({
  label,
  description,
  value,
  options,
  onChange,
}: {
  label: string;
  description?: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {description && <div className="text-xs text-neutral-500 dark:text-neutral-400">{description}</div>}
      </div>
      <div role="radiogroup" aria-label={label} className="flex w-fit gap-0.5 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.value)}
              className={
                active
                  ? "rounded-md bg-white px-3 py-1.5 text-sm font-medium text-neutral-900 shadow-xs dark:bg-neutral-950 dark:text-white"
                  : "rounded-md px-3 py-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              }
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DownloadRow({ href, label, hint }: { href: string; label: string; hint?: string }) {
  return (
    <a
      href={href}
      className="group flex items-center gap-3 py-3 text-sm hover:text-neutral-900 dark:hover:text-white"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 group-hover:text-brand dark:bg-neutral-800 dark:text-neutral-400">
        <Icon name="download" size={16} />
      </span>
      <span className="flex-1">
        <span className="font-medium">{label}</span>
        {hint && <span className="block text-xs text-neutral-500 dark:text-neutral-400">{hint}</span>}
      </span>
    </a>
  );
}

export function SettingsClient({ checklistSteps }: { checklistSteps: { id: string; label: string }[] }) {
  const { prefs, setPrefs, isSaving } = useUnits();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <PageHeader
        title="Einstellungen"
        subtitle={isSaving ? "Speichere…" : undefined}
      />

      <Section title="Darstellung & Einheiten" description="Einheiten lassen sich zusätzlich pro Eingabefeld umschalten.">
        <Card className="divide-y divide-neutral-100 py-1 sm:py-1 dark:divide-neutral-800">
          <Segmented
            label="Design"
            value={(theme ?? "system") as "system" | "light" | "dark"}
            options={[
              { value: "system", label: "System" },
              { value: "light", label: "Hell" },
              { value: "dark", label: "Dunkel" },
            ]}
            onChange={setTheme}
          />
          <Segmented<WeightUnit>
            label="Gewicht"
            description="Pulverladung, Geschossgewicht"
            value={prefs.weightUnit}
            options={[
              { value: "grain", label: "Grain" },
              { value: "gram", label: "Gramm" },
            ]}
            onChange={(weightUnit) => setPrefs({ ...prefs, weightUnit })}
          />
          <Segmented<LengthUnit>
            label="Länge"
            description="OAL, CBTO, Lauflänge, Gruppengröße"
            value={prefs.lengthUnit}
            options={[
              { value: "mm", label: "mm" },
              { value: "in", label: "Zoll" },
            ]}
            onChange={(lengthUnit) => setPrefs({ ...prefs, lengthUnit })}
          />
          <Segmented<VelocityUnit>
            label="Geschwindigkeit"
            value={prefs.velocityUnit}
            options={[
              { value: "mps", label: "m/s" },
              { value: "fps", label: "fps" },
            ]}
            onChange={(velocityUnit) => setPrefs({ ...prefs, velocityUnit })}
          />
        </Card>
      </Section>

      <Section
        title="Wiederlade-Checkliste"
        description="Diese Schritte lassen sich bei jeder Ladung einzeln abhaken."
        action={
          <LinkButton href="/checklist/label" variant="secondary" size="sm" icon="printer">
            Etikett
          </LinkButton>
        }
      >
        <Card>
          <ChecklistStepsManager steps={checklistSteps} />
        </Card>
      </Section>

      <Section title="Export" description="CSV-Dateien, z.B. für Excel.">
        <Card className="divide-y divide-neutral-100 py-1 sm:py-1 dark:divide-neutral-800">
          <DownloadRow href="/api/export/loads" label="Ladedaten" />
          <DownloadRow href="/api/export/sessions" label="Sessions" />
          <DownloadRow href="/api/export/shot-groups" label="Schussgruppen" />
          <DownloadRow href="/api/export/velocity-shots" label="Geschwindigkeitsmessungen" />
        </Card>
      </Section>

      <Section
        title="Datensicherung"
        description="Datenbank und Bilder zusammen ergeben ein vollständiges Backup — die Datenbank enthält nur Verweise auf die Bilddateien."
      >
        <Card className="divide-y divide-neutral-100 py-1 sm:py-1 dark:divide-neutral-800">
          <DownloadRow href="/api/export/backup" label="Datenbank-Backup herunterladen" hint="SQLite-Datei (.db)" />
          <DownloadRow href="/api/export/images" label="Alle Bilder herunterladen" hint="ZIP-Archiv" />
          <div className="py-3">
            <RestoreBackupForm />
          </div>
        </Card>
      </Section>

      <p className="text-xs text-neutral-400">Wiederladen · Version {APP_VERSION}</p>
    </div>
  );
}
