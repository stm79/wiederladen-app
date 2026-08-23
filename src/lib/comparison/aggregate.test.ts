import { describe, expect, it } from "vitest";
import { buildComparisonRow, type LoadForComparison } from "./aggregate";

function baseLoad(overrides: Partial<LoadForComparison> = {}): LoadForComparison {
  return {
    id: "l1",
    name: null,
    firearmId: "f1",
    firearmName: "Test Rifle",
    caliber: ".308 Win",
    powder: "N150",
    chargeGrains: 42,
    bullet: "MatchKing",
    bulletWeightGr: 168,
    oalMm: 71.5,
    velocitiesMps: [],
    extremeSpreadsMm: [],
    ...overrides,
  };
}

describe("buildComparisonRow", () => {
  it("computes velocity stats from raw shots across all velocity sets", () => {
    const row = buildComparisonRow(baseLoad({ velocitiesMps: [800, 810, 820, 790, 805] }));
    expect(row.avgMps).toBeCloseTo(805, 6);
    expect(row.esMps).toBeCloseTo(30, 6);
    expect(row.shotCount).toBe(5);
  });

  it("averages extreme spread across all shot groups", () => {
    const row = buildComparisonRow(baseLoad({ extremeSpreadsMm: [20, 24, 22] }));
    expect(row.meanExtremeSpreadMm).toBeCloseTo(22, 6);
    expect(row.groupCount).toBe(3);
  });

  it("returns nulls when there is no data yet", () => {
    const row = buildComparisonRow(baseLoad());
    expect(row.avgMps).toBeNull();
    expect(row.sdMps).toBeNull();
    expect(row.esMps).toBeNull();
    expect(row.meanExtremeSpreadMm).toBeNull();
  });

  it("falls back to caliber + bullet weight + bullet when no name is set", () => {
    expect(buildComparisonRow(baseLoad({ name: "Stufe 3" })).loadLabel).toBe("Stufe 3");
    expect(buildComparisonRow(baseLoad({ name: null })).loadLabel).toBe(".308 Win 168gr MatchKing");
    expect(
      buildComparisonRow(baseLoad({ name: null, caliber: ".308 Win", bulletWeightGr: null, bullet: null })).loadLabel
    ).toBe(".308 Win");
  });
});
