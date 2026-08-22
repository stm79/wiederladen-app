import { describe, expect, it } from "vitest";
import { calibrationScaleFactor, extremeSpreadMm, meanRadiusMm, centroid } from "./metrics";

describe("calibrationScaleFactor", () => {
  it("computes mm per pixel from two calibration points", () => {
    // 100px apart in image, known to be 50mm in reality -> 0.5 mm/px
    const scale = calibrationScaleFactor({ x: 0, y: 0 }, { x: 100, y: 0 }, 50);
    expect(scale).toBeCloseTo(0.5, 6);
  });

  it("throws for identical points", () => {
    expect(() => calibrationScaleFactor({ x: 10, y: 10 }, { x: 10, y: 10 }, 50)).toThrow();
  });
});

describe("extremeSpreadMm", () => {
  it("returns null for fewer than 2 points", () => {
    expect(extremeSpreadMm([], 1)).toBeNull();
    expect(extremeSpreadMm([{ x: 0, y: 0 }], 1)).toBeNull();
  });

  it("finds the maximum pairwise distance, scaled to mm", () => {
    // Right triangle 3-4-5 in pixels, scale 2 mm/px -> hypotenuse should win: 5*2=10mm
    const points = [
      { x: 0, y: 0 },
      { x: 3, y: 0 },
      { x: 0, y: 4 },
    ];
    expect(extremeSpreadMm(points, 2)).toBeCloseTo(10, 6);
  });

  it("known square: diagonal is the extreme spread", () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ];
    // diagonal = 10*sqrt(2) px, scale 1mm/px
    expect(extremeSpreadMm(points, 1)).toBeCloseTo(10 * Math.SQRT2, 6);
  });
});

describe("meanRadiusMm", () => {
  it("returns null for fewer than 2 points", () => {
    expect(meanRadiusMm([{ x: 0, y: 0 }], 1)).toBeNull();
  });

  it("computes average distance to centroid, scaled to mm", () => {
    // 4 points on a unit circle around origin at 0/90/180/270 degrees, radius 10px
    const points = [
      { x: 10, y: 0 },
      { x: -10, y: 0 },
      { x: 0, y: 10 },
      { x: 0, y: -10 },
    ];
    // centroid is (0,0), every point is exactly 10px away -> mean radius 10px * scale
    expect(meanRadiusMm(points, 1.5)).toBeCloseTo(15, 6);
  });
});

describe("centroid", () => {
  it("averages point coordinates", () => {
    const c = centroid([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 5, y: 10 },
    ]);
    expect(c).toEqual({ x: 5, y: 10 / 3 });
  });

  it("returns null for empty input", () => {
    expect(centroid([])).toBeNull();
  });
});
