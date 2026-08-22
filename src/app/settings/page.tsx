"use client";

import { useTheme } from "next-themes";
import { useUnits } from "@/components/units/UnitProvider";
import type { LengthUnit, VelocityUnit, WeightUnit } from "@/lib/units/types";
import { RestoreBackupForm } from "@/components/settings/RestoreBackupForm";
import { APP_VERSION } from "@/lib/version";

function OptionButton<T extends string>({
  value,
  current,
  label,
  onClick,
}: {
  value: T;
  current: T;
  label: string;
  onClick: (v: T) => void;
}) {
  const active = value === current;
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={
        active
          ? "rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
          : "rounded-md bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
      }
    >
      {label}
    </button>
  );
}

export default function SettingsPage() {
  const { prefs, setPrefs, isSaving } = useUnits();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex max-w-md flex-col gap-8">
      <h1 className="text-xl font-semibold">Einstellungen</h1>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Darstellung</h2>
        <div className="flex gap-2">
          <OptionButton
            value="system"
            current={theme ?? "system"}
            label="System"
            onClick={setTheme}
          />
          <OptionButton
            value="light"
            current={theme ?? "system"}
            label="Hell"
            onClick={setTheme}
          />
          <OptionButton
            value="dark"
            current={theme ?? "system"}
            label="Dunkel"
            onClick={setTheme}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Gewicht (Pulverladung, Geschossgewicht)
        </h2>
        <div className="flex gap-2">
          <OptionButton<WeightUnit>
            value="grain"
            current={prefs.weightUnit}
            label="Grain"
            onClick={(weightUnit) => setPrefs({ ...prefs, weightUnit })}
          />
          <OptionButton<WeightUnit>
            value="gram"
            current={prefs.weightUnit}
            label="Gramm"
            onClick={(weightUnit) => setPrefs({ ...prefs, weightUnit })}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Länge (OAL, CBTO, Lauflänge)
        </h2>
        <div className="flex gap-2">
          <OptionButton<LengthUnit>
            value="mm"
            current={prefs.lengthUnit}
            label="Millimeter"
            onClick={(lengthUnit) => setPrefs({ ...prefs, lengthUnit })}
          />
          <OptionButton<LengthUnit>
            value="in"
            current={prefs.lengthUnit}
            label="Zoll"
            onClick={(lengthUnit) => setPrefs({ ...prefs, lengthUnit })}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Geschwindigkeit
        </h2>
        <div className="flex gap-2">
          <OptionButton<VelocityUnit>
            value="mps"
            current={prefs.velocityUnit}
            label="m/s"
            onClick={(velocityUnit) => setPrefs({ ...prefs, velocityUnit })}
          />
          <OptionButton<VelocityUnit>
            value="fps"
            current={prefs.velocityUnit}
            label="fps"
            onClick={(velocityUnit) => setPrefs({ ...prefs, velocityUnit })}
          />
        </div>
      </section>

      {isSaving && <p className="text-xs text-neutral-400">Speichere…</p>}

      <section className="flex flex-col gap-3 border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Export</h2>
        <div className="flex flex-col gap-2 text-sm">
          <a href="/api/export/loads" className="text-neutral-600 underline dark:text-neutral-400">
            Ladedaten als CSV herunterladen
          </a>
          <a href="/api/export/sessions" className="text-neutral-600 underline dark:text-neutral-400">
            Sessions als CSV herunterladen
          </a>
          <a href="/api/export/velocity-shots" className="text-neutral-600 underline dark:text-neutral-400">
            Geschwindigkeitsmessungen als CSV herunterladen
          </a>
          <a href="/api/export/shot-groups" className="text-neutral-600 underline dark:text-neutral-400">
            Schussgruppen als CSV herunterladen
          </a>
        </div>
      </section>

      <section className="flex flex-col gap-3 border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Datensicherung</h2>
        <div className="flex flex-col gap-2 text-sm">
          <a href="/api/export/backup" className="text-neutral-600 underline dark:text-neutral-400">
            Datenbank-Backup herunterladen
          </a>
          <a href="/api/export/images" className="text-neutral-600 underline dark:text-neutral-400">
            Alle Bilder herunterladen (ZIP)
          </a>
          <p className="text-xs text-neutral-400">
            Beide zusammen ergeben ein vollständiges Backup — die Datenbank enthält keine Bilddateien, nur
            Verweise darauf.
          </p>
          <RestoreBackupForm />
        </div>
      </section>

      <section className="border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <p className="text-xs text-neutral-400">Version {APP_VERSION}</p>
      </section>
    </div>
  );
}
