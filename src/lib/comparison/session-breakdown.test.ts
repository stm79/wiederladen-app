import { describe, expect, it } from "vitest";
import { buildLoadSessionBreakdown, type LoadSessionGroupInput } from "./session-breakdown";

function group(overrides: Partial<LoadSessionGroupInput> = {}): LoadSessionGroupInput {
  return {
    sessionId: "s1",
    sessionDate: new Date("2026-08-01"),
    sessionLocation: "Range A",
    tempC: 20,
    pressureHPa: null,
    humidityPct: null,
    extremeSpreadMm: null,
    velocitiesMps: [],
    ...overrides,
  };
}

describe("buildLoadSessionBreakdown", () => {
  it("keeps sessions separate instead of averaging across all of them", () => {
    const rows = buildLoadSessionBreakdown([
      group({ sessionId: "s1", tempC: 5, velocitiesMps: [780, 782, 781] }),
      group({ sessionId: "s2", sessionDate: new Date("2026-08-15"), tempC: 25, velocitiesMps: [800, 802, 801] }),
    ]);

    expect(rows).toHaveLength(2);
    expect(rows.find((r) => r.sessionId === "s1")?.avgMps).toBeCloseTo(781, 6);
    expect(rows.find((r) => r.sessionId === "s2")?.avgMps).toBeCloseTo(801, 6);
  });

  it("merges multiple shot groups within the same session into one row", () => {
    const rows = buildLoadSessionBreakdown([
      group({ velocitiesMps: [790, 792], extremeSpreadMm: 20 }),
      group({ velocitiesMps: [791, 793], extremeSpreadMm: 24 }),
    ]);

    expect(rows).toHaveLength(1);
    expect(rows[0].shotCount).toBe(4);
    expect(rows[0].meanExtremeSpreadMm).toBeCloseTo(22, 6);
    expect(rows[0].groupCount).toBe(2);
  });

  it("sorts sessions chronologically", () => {
    const rows = buildLoadSessionBreakdown([
      group({ sessionId: "later", sessionDate: new Date("2026-08-20") }),
      group({ sessionId: "earlier", sessionDate: new Date("2026-08-01") }),
    ]);

    expect(rows.map((r) => r.sessionId)).toEqual(["earlier", "later"]);
  });

  it("returns null stats for a session with no velocity data yet", () => {
    const rows = buildLoadSessionBreakdown([group({ velocitiesMps: [] })]);
    expect(rows[0].avgMps).toBeNull();
    expect(rows[0].shotCount).toBe(0);
  });
});
