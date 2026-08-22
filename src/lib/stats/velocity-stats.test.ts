import { describe, expect, it } from "vitest";
import { computeVelocityStats } from "./velocity-stats";

describe("computeVelocityStats", () => {
  it("returns null for empty input", () => {
    expect(computeVelocityStats([])).toBeNull();
  });

  it("handles a single shot (sd/es are 0)", () => {
    expect(computeVelocityStats([800])).toEqual({ avgMps: 800, sdMps: 0, esMps: 0 });
  });

  it("computes avg/sd/es for a known shot string", () => {
    // 800, 810, 820, 790, 805 -> avg = 805, es = 30
    const stats = computeVelocityStats([800, 810, 820, 790, 805]);
    expect(stats).not.toBeNull();
    expect(stats!.avgMps).toBeCloseTo(805, 6);
    expect(stats!.esMps).toBeCloseTo(30, 6);
    // sample stddev of [800,810,820,790,805], mean 805:
    // deviations: -5,5,15,-15,0 -> squares: 25,25,225,225,0 = 500 / (5-1) = 125 -> sqrt = ~11.18
    expect(stats!.sdMps).toBeCloseTo(11.1803, 3);
  });

  it("es is the max-min spread regardless of order", () => {
    const stats = computeVelocityStats([820, 790, 800]);
    expect(stats!.esMps).toBeCloseTo(30, 6);
  });
});
