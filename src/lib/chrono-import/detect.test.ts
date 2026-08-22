import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { detectCsvFormat } from "./detect";
import { applyMapping } from "./apply-mapping";
import { computeVelocityStats } from "@/lib/stats/velocity-stats";

function fixture(name: string): string {
  return readFileSync(path.resolve(process.cwd(), "test/fixtures/chrono", name), "utf-8");
}

describe("detectCsvFormat — generic fallback", () => {
  it("falls back to a generic fuzzy mapping when no branded parser matches", () => {
    const text = "Schuss Nr.,Geschwindigkeit (m/s)\n1,820\n";
    const result = detectCsvFormat(text, "export.csv");
    expect(result.id).toBe("generic");
    expect(result.confidence).toBe("low");
    expect(result.series[0].suggestedMapping).toEqual({
      shotNumberColumn: 0,
      velocityColumn: 1,
      velocityUnit: "mps",
    });
  });

  it("returns a null mapping when no velocity-like column is found", () => {
    const result = detectCsvFormat("Foo,Bar\n1,2\n", "mystery.csv");
    expect(result.series[0].suggestedMapping).toBeNull();
  });
});

describe("detectCsvFormat — LabRadar (real sample export)", () => {
  it("detects the format and extracts V0 (muzzle velocity) in the file's own unit", () => {
    const text = fixture("labradar-sample-report.csv");
    const result = detectCsvFormat(text, "SR0001 Report.csv");

    expect(result.id).toBe("labradar");
    expect(result.confidence).toBe("high");
    expect(result.series).toHaveLength(1);

    const series = result.series[0];
    expect(series.suggestedMapping?.velocityUnit).toBe("mps"); // file declares "Units velocity;m/s"

    const shots = applyMapping(series.table, series.suggestedMapping!);
    expect(shots).toEqual([
      { shotNumber: 1, velocityMps: 817 },
      { shotNumber: 2, velocityMps: 621 },
    ]);

    const stats = computeVelocityStats(shots.map((s) => s.velocityMps));
    expect(stats!.esMps).toBe(196);
  });
});

describe("detectCsvFormat — Garmin Xero (real sample export)", () => {
  it("detects the format, skips the title/summary rows, and parses comma-decimal velocities", () => {
    const text = fixture("garmin-xero-sample.csv");
    const result = detectCsvFormat(text, "Gewehrkugel_2025-12-15_16-08-41.csv");

    expect(result.id).toBe("garmin-xero");
    expect(result.confidence).toBe("high");

    const series = result.series[0];
    const shots = applyMapping(series.table, series.suggestedMapping!);
    expect(shots.map((s) => s.velocityMps)).toEqual([822.6, 812.1, 808.2, 806.3, 815.0]);

    const stats = computeVelocityStats(shots.map((s) => s.velocityMps));
    expect(stats!.avgMps).toBeCloseTo(812.84, 2);
    expect(stats!.esMps).toBeCloseTo(16.3, 6);
  });
});

describe("detectCsvFormat — MagnetoSpeed (real sample export, multi-series)", () => {
  it("splits the file into separately pickable series", () => {
    const text = fixture("magnetospeed-sample.csv");
    const result = detectCsvFormat(text, "20200917-65R62.CSV");

    expect(result.id).toBe("magnetospeed");
    expect(result.confidence).toBe("high");
    expect(result.series).toHaveLength(2);
    expect(result.series[0].label).toContain("37");
    expect(result.series[1].label).toContain("38");
  });

  it("extracts correct velocities for the second series (10 shots)", () => {
    const text = fixture("magnetospeed-sample.csv");
    const result = detectCsvFormat(text, "20200917-65R62.CSV");
    const series38 = result.series[1];

    const shots = applyMapping(series38.table, series38.suggestedMapping!);
    expect(shots.map((s) => s.velocityMps)).toEqual([842, 842, 845, 855, 851, 845, 847, 843, 847, 862]);

    const stats = computeVelocityStats(shots.map((s) => s.velocityMps));
    expect(stats!.sdMps).toBeCloseTo(6.42, 1); // file's own stated "S-D, 6.4" (sample stddev)
  });

  it("dispatches to the first (3-shot) series correctly", () => {
    const text = fixture("magnetospeed-sample.csv");
    const result = detectCsvFormat(text, "20200917-65R62.CSV");
    const series37 = result.series[0];

    const shots = applyMapping(series37.table, series37.suggestedMapping!);
    expect(shots.map((s) => s.velocityMps)).toEqual([840, 844, 843]);
  });
});
