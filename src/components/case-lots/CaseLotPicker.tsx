"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { createCaseLot } from "@/app/actions/case-lots";
import { FormField, inputClass } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { caseLotCycles, caseLotLabel, formatCaseLotNumber, type LotLoad } from "@/lib/case-lots/history";
import { formatLoadNumber } from "@/lib/loads/variant-letter";
import type { CaseLotOption } from "@/lib/case-lots/options";

interface CaseLotPickerProps {
  lots: CaseLotOption[];
  value: string | null | undefined;
  onChange: (lot: CaseLotOption | null) => void;
  /** Caliber of the firearm currently selected in the form. */
  caliber: string | undefined;
  /** The load being edited, as currently entered in the form (for the preview). */
  current: {
    id: string | undefined;
    loadNumber: number;
    variantLetter: string;
    caseLoadCount: number | null;
    createdAt: string;
  };
}

const CURRENT_ID = "__current__";

/** "Hülsen-Charge" field of the load form: pick (or create) the batch of
 *  cases this load uses, and see where those cases have been before. */
export function CaseLotPicker({ lots: initialLots, value, onChange, caliber, current }: CaseLotPickerProps) {
  const [lots, setLots] = useState(initialLots);
  const [creating, setCreating] = useState(false);

  const selected = lots.find((l) => l.id === value) ?? null;
  const visible = lots.filter((l) => !l.retired || l.id === value);
  const matching = caliber ? visible.filter((l) => l.caliber === caliber) : visible;
  const others = caliber ? visible.filter((l) => l.caliber !== caliber) : [];

  const option = (lot: CaseLotOption) => (
    <option key={lot.id} value={lot.id}>
      {caseLotLabel(lot)}
      {lot.retired ? " — ausgemustert" : ""}
    </option>
  );

  return (
    <div className="col-span-full flex flex-col gap-3">
      <FormField label="Hülsen-Charge" htmlFor="caseLotId">
        <div className="flex gap-2">
          <select
            id="caseLotId"
            className={inputClass}
            value={value ?? ""}
            onChange={(e) => onChange(lots.find((l) => l.id === e.target.value) ?? null)}
          >
            <option value="">— keine Charge —</option>
            {others.length > 0 && matching.length > 0 ? (
              <>
                <optgroup label={caliber}>{matching.map(option)}</optgroup>
                <optgroup label="Andere Kaliber">{others.map(option)}</optgroup>
              </>
            ) : (
              [...matching, ...others].map(option)
            )}
          </select>
          {!creating && (
            <Button
              type="button"
              variant="secondary"
              icon="plus"
              aria-label="Neue Charge"
              onClick={() => setCreating(true)}
            >
              <span className="hidden @md:inline">Neue Charge</span>
            </Button>
          )}
        </div>
      </FormField>

      {creating && (
        <NewLotPanel
          caliber={caliber}
          onCancel={() => setCreating(false)}
          onCreated={(lot) => {
            setLots((prev) => [lot, ...prev]);
            setCreating(false);
            onChange(lot);
          }}
        />
      )}

      {selected && <LotHistory lot={selected} current={current} />}
    </div>
  );
}

function LotHistory({ lot, current }: { lot: CaseLotOption; current: CaseLotPickerProps["current"] }) {
  const loads: LotLoad[] = [
    ...lot.loads.filter((l) => l.id !== current.id),
    { ...current, id: CURRENT_ID, createdAt: current.createdAt || new Date().toISOString() },
  ];
  const cycles = caseLotCycles(loads);

  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50/70 px-3 py-2.5 dark:border-neutral-800 dark:bg-neutral-950/50">
      <div className="mb-2 flex items-center justify-between gap-2 text-xs text-neutral-500 dark:text-neutral-400">
        <span>
          Verlauf von <span className="font-mono font-semibold">{formatCaseLotNumber(lot.number)}</span>
          {lot.quantity != null && <> · {lot.quantity} Stück</>}
        </span>
        <Link
          href={`/cases/${lot.id}`}
          className="inline-flex items-center gap-0.5 hover:text-neutral-900 hover:underline dark:hover:text-white"
        >
          Charge öffnen <Icon name="chevronRight" size={13} />
        </Link>
      </div>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-2" aria-label="Ladezyklen dieser Charge">
        {cycles.map((cycle, i) => (
          <Fragment key={cycle.loadNumber}>
            {i > 0 && (
              <li aria-hidden className="text-neutral-300 dark:text-neutral-600">
                <Icon name="chevronRight" size={14} />
              </li>
            )}
            <li className="flex items-center gap-1">
              {cycle.loads.map((l) =>
                l.id === CURRENT_ID ? (
                  <span
                    key={l.id}
                    title="Diese Ladung"
                    className="rounded-md bg-brand px-1.5 py-0.5 font-mono text-xs font-semibold tabular-nums text-white dark:text-neutral-950"
                  >
                    {formatLoadNumber(l.loadNumber || 0, l.variantLetter.toUpperCase())}
                  </span>
                ) : (
                  <Link
                    key={l.id}
                    href={`/loads/${l.id}`}
                    className="rounded-md bg-brand-soft px-1.5 py-0.5 font-mono text-xs font-semibold tabular-nums text-brand-strong hover:underline"
                  >
                    {formatLoadNumber(l.loadNumber, l.variantLetter)}
                  </Link>
                )
              )}
              <span className="text-xs tabular-nums text-neutral-500 dark:text-neutral-400">
                {cycle.loadCount != null ? `${cycle.loadCount}×` : "?×"}
              </span>
            </li>
          </Fragment>
        ))}
      </ol>
    </div>
  );
}

function NewLotPanel({
  caliber,
  onCancel,
  onCreated,
}: {
  caliber: string | undefined;
  onCancel: () => void;
  onCreated: (lot: CaseLotOption) => void;
}) {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [lotCaliber, setLotCaliber] = useState(caliber ?? "");
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function create() {
    const finalName = name.trim() || [brand.trim(), lotCaliber.trim()].filter(Boolean).join(" ");
    if (!finalName) {
      setError("Bitte einen Namen oder eine Marke angeben.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const result = await createCaseLot({
        name: finalName,
        brand,
        caliber: lotCaliber,
        quantity: quantity ? Number(quantity) : null,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const { lot } = result;
      onCreated({
        id: lot.id,
        number: lot.number,
        name: lot.name,
        brand: lot.brand,
        caliber: lot.caliber,
        quantity: lot.quantity,
        retired: lot.retired,
        loads: [],
      });
    } catch {
      setError("Charge konnte nicht angelegt werden.");
    } finally {
      setSaving(false);
    }
  }

  return (
    // Not a <form>: this sits inside the load form, and forms can't nest.
    <div
      className="grid grid-cols-1 gap-3 rounded-lg border border-brand/40 bg-brand-soft/40 p-3 @md:grid-cols-2"
      onKeyDown={(e) => {
        if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") {
          e.preventDefault();
          void create();
        }
      }}
    >
      <div className="col-span-full text-sm font-medium">Neue Hülsen-Charge</div>
      <FormField label="Name" htmlFor="newLotName" hint="Leer lassen = Marke + Kaliber">
        <input
          id="newLotName"
          className={inputClass}
          placeholder="z.B. Lapua Match 2025"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </FormField>
      <FormField label="Marke" htmlFor="newLotBrand">
        <input
          id="newLotBrand"
          className={inputClass}
          placeholder="z.B. Lapua"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        />
      </FormField>
      <FormField label="Kaliber" htmlFor="newLotCaliber">
        <input
          id="newLotCaliber"
          className={inputClass}
          value={lotCaliber}
          onChange={(e) => setLotCaliber(e.target.value)}
        />
      </FormField>
      <FormField label="Anzahl (Stück)" htmlFor="newLotQuantity">
        <input
          id="newLotQuantity"
          type="number"
          min="1"
          step="1"
          inputMode="numeric"
          className={`${inputClass} tabular-nums`}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </FormField>
      {error && <p className="col-span-full text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
      <div className="col-span-full flex gap-2">
        <Button type="button" size="sm" icon="check" disabled={saving} onClick={() => void create()}>
          {saving ? "Anlegen…" : "Charge anlegen"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          Abbrechen
        </Button>
      </div>
    </div>
  );
}
