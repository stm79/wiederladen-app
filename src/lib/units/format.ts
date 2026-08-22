import type { LengthUnit, UnitPreferences, VelocityUnit, WeightUnit } from "./types";
import {
  weightFromCanonical,
  weightToCanonical,
  lengthFromCanonical,
  lengthToCanonical,
  velocityFromCanonical,
  velocityToCanonical,
} from "./conversions";

export type UnitKind = "weight" | "length" | "velocity";
export type AnyUnit = WeightUnit | LengthUnit | VelocityUnit;

export function unitForKind(kind: UnitKind, prefs: UnitPreferences) {
  switch (kind) {
    case "weight":
      return prefs.weightUnit;
    case "length":
      return prefs.lengthUnit;
    case "velocity":
      return prefs.velocityUnit;
  }
}

/** Canonical DB value -> value in the user's preferred display unit. */
export function toDisplayValue(kind: UnitKind, canonical: number, prefs: UnitPreferences): number {
  return toDisplayValueForUnit(kind, canonical, unitForKind(kind, prefs));
}

/** Value entered in the user's preferred display unit -> canonical DB value. */
export function toCanonicalValue(kind: UnitKind, display: number, prefs: UnitPreferences): number {
  return toCanonicalValueForUnit(kind, display, unitForKind(kind, prefs));
}

/** The two selectable units for a given kind, in a fixed order. */
export const KIND_UNIT_PAIR: Record<UnitKind, [AnyUnit, AnyUnit]> = {
  weight: ["grain", "gram"],
  length: ["mm", "in"],
  velocity: ["mps", "fps"],
};

/** The other unit in the pair — used by the per-field unit toggle. */
export function otherUnit(kind: UnitKind, unit: AnyUnit): AnyUnit {
  const [a, b] = KIND_UNIT_PAIR[kind];
  return unit === a ? b : a;
}

/** Canonical DB value -> value in an explicitly given unit (not the global preference —
 *  used by the per-field unit toggle, which can override the default locally). */
export function toDisplayValueForUnit(kind: UnitKind, canonical: number, unit: AnyUnit): number {
  switch (kind) {
    case "weight":
      return weightFromCanonical(canonical, unit as WeightUnit);
    case "length":
      return lengthFromCanonical(canonical, unit as LengthUnit);
    case "velocity":
      return velocityFromCanonical(canonical, unit as VelocityUnit);
  }
}

/** Value entered in an explicitly given unit -> canonical DB value. */
export function toCanonicalValueForUnit(kind: UnitKind, display: number, unit: AnyUnit): number {
  switch (kind) {
    case "weight":
      return weightToCanonical(display, unit as WeightUnit);
    case "length":
      return lengthToCanonical(display, unit as LengthUnit);
    case "velocity":
      return velocityToCanonical(display, unit as VelocityUnit);
  }
}
