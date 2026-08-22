import { describe, expect, it } from "vitest";
import { applyMapping } from "./apply-mapping";
import type { RawTable } from "./types";

const table: RawTable = {
  headers: ["Shot", "Velocity (m/s)", "Note"],
  rows: [
    ["1", "820.5", ""],
    ["2", "815.2", ""],
    ["3", "", ""], // blank velocity should be skipped
    ["4", "abc", ""], // non-numeric should be skipped
    ["5", "830,1", ""], // comma decimal separator
  ],
};

describe("applyMapping", () => {
  it("maps columns and converts using explicit shot numbers", () => {
    const shots = applyMapping(table, { shotNumberColumn: 0, velocityColumn: 1, velocityUnit: "mps" });
    expect(shots).toEqual([
      { shotNumber: 1, velocityMps: 820.5 },
      { shotNumber: 2, velocityMps: 815.2 },
      { shotNumber: 5, velocityMps: 830.1 },
    ]);
  });

  it("auto-numbers rows when shotNumberColumn is null", () => {
    const shots = applyMapping(table, { shotNumberColumn: null, velocityColumn: 1, velocityUnit: "mps" });
    expect(shots.map((s) => s.shotNumber)).toEqual([1, 2, 3]);
  });

  it("converts fps to canonical m/s", () => {
    const fpsTable: RawTable = { headers: ["Shot", "Velocity (fps)"], rows: [["1", "2700"]] };
    const shots = applyMapping(fpsTable, { shotNumberColumn: 0, velocityColumn: 1, velocityUnit: "fps" });
    // 2700 fps / 3.280839895 fps-per-mps
    expect(shots[0].velocityMps).toBeCloseTo(822.96, 2);
  });
});
