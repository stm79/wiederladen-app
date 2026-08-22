import { toDisplayValue, type UnitKind } from "@/lib/units/format";
import { UNIT_LABELS, type UnitPreferences } from "@/lib/units/types";

export function fmt(kind: UnitKind, value: number | null, prefs: UnitPreferences, digits = 2): string {
  if (value == null) return "—";
  const unit =
    kind === "weight" ? prefs.weightUnit : kind === "length" ? prefs.lengthUnit : prefs.velocityUnit;
  return `${toDisplayValue(kind, value, prefs).toFixed(digits)} ${UNIT_LABELS[unit]}`;
}

export function fmtDate(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(date);
}

export function fmtDateTime(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short" }).format(date);
}
