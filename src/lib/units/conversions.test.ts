import { describe, expect, it } from "vitest";
import {
  weightFromCanonical,
  weightToCanonical,
  lengthFromCanonical,
  lengthToCanonical,
  velocityFromCanonical,
  velocityToCanonical,
} from "./conversions";

describe("unit conversions round-trip", () => {
  it("weight: grain <-> gram", () => {
    const grains = 42.5;
    const grams = weightFromCanonical(grains, "gram");
    expect(weightToCanonical(grams, "gram")).toBeCloseTo(grains, 6);
    expect(weightFromCanonical(grains, "grain")).toBe(grains);
  });

  it("length: mm <-> in", () => {
    const mm = 61.2;
    const inches = lengthFromCanonical(mm, "in");
    expect(lengthToCanonical(inches, "in")).toBeCloseTo(mm, 6);
    expect(lengthFromCanonical(mm, "mm")).toBe(mm);
  });

  it("velocity: m/s <-> fps", () => {
    const mps = 823.4;
    const fps = velocityFromCanonical(mps, "fps");
    expect(velocityToCanonical(fps, "fps")).toBeCloseTo(mps, 6);
    expect(velocityFromCanonical(mps, "mps")).toBe(mps);
  });

  it("known reference points", () => {
    expect(weightFromCanonical(1, "gram")).toBeCloseTo(0.06479891, 6);
    expect(lengthFromCanonical(25.4, "in")).toBeCloseTo(1, 6);
    expect(velocityFromCanonical(1, "fps")).toBeCloseTo(3.280839895, 6);
  });
});
