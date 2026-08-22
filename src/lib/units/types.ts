export type WeightUnit = "grain" | "gram";
export type LengthUnit = "mm" | "in";
export type VelocityUnit = "mps" | "fps";

export interface UnitPreferences {
  weightUnit: WeightUnit;
  lengthUnit: LengthUnit;
  velocityUnit: VelocityUnit;
}

export const DEFAULT_UNIT_PREFERENCES: UnitPreferences = {
  weightUnit: "grain",
  lengthUnit: "mm",
  velocityUnit: "mps",
};

export const UNIT_LABELS: Record<WeightUnit | LengthUnit | VelocityUnit, string> = {
  grain: "gr",
  gram: "g",
  mm: "mm",
  in: "in",
  mps: "m/s",
  fps: "fps",
};
