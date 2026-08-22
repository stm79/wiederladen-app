import type { LengthUnit, VelocityUnit, WeightUnit } from "./types";

const GRAINS_PER_GRAM = 15.4323584;
const MM_PER_INCH = 25.4;
const FPS_PER_MPS = 3.280839895;

export function grainsToGrams(grains: number): number {
  return grains / GRAINS_PER_GRAM;
}

export function gramsToGrains(grams: number): number {
  return grams * GRAINS_PER_GRAM;
}

export function mmToInches(mm: number): number {
  return mm / MM_PER_INCH;
}

export function inchesToMm(inches: number): number {
  return inches * MM_PER_INCH;
}

export function mpsToFps(mps: number): number {
  return mps * FPS_PER_MPS;
}

export function fpsToMps(fps: number): number {
  return fps / FPS_PER_MPS;
}

/** Converts a canonical value (grains) to the given display unit. */
export function weightFromCanonical(grains: number, unit: WeightUnit): number {
  return unit === "gram" ? grainsToGrams(grains) : grains;
}

/** Converts a value entered in the given display unit back to canonical grains. */
export function weightToCanonical(value: number, unit: WeightUnit): number {
  return unit === "gram" ? gramsToGrains(value) : value;
}

/** Converts a canonical value (mm) to the given display unit. */
export function lengthFromCanonical(mm: number, unit: LengthUnit): number {
  return unit === "in" ? mmToInches(mm) : mm;
}

/** Converts a value entered in the given display unit back to canonical mm. */
export function lengthToCanonical(value: number, unit: LengthUnit): number {
  return unit === "in" ? inchesToMm(value) : value;
}

/** Converts a canonical value (m/s) to the given display unit. */
export function velocityFromCanonical(mps: number, unit: VelocityUnit): number {
  return unit === "fps" ? mpsToFps(mps) : mps;
}

/** Converts a value entered in the given display unit back to canonical m/s. */
export function velocityToCanonical(value: number, unit: VelocityUnit): number {
  return unit === "fps" ? fpsToMps(value) : value;
}
