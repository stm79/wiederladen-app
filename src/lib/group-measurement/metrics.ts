export interface Point {
  x: number;
  y: number;
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Scale factor in real-world mm per image pixel, from two calibration points
 *  a known real-world distance apart. */
export function calibrationScaleFactor(p1: Point, p2: Point, realDistanceMm: number): number {
  const pixelDistance = distance(p1, p2);
  if (pixelDistance <= 0) {
    throw new Error("Kalibrierungspunkte dürfen nicht identisch sein");
  }
  return realDistanceMm / pixelDistance;
}

/** Extreme spread: largest pairwise distance between any two shot points, in mm. */
export function extremeSpreadMm(points: Point[], scaleFactorMmPerPx: number): number | null {
  if (points.length < 2) return null;
  let max = 0;
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      max = Math.max(max, distance(points[i], points[j]));
    }
  }
  return max * scaleFactorMmPerPx;
}

/** Mean radius: average distance of all shot points to their centroid, in mm. */
export function meanRadiusMm(points: Point[], scaleFactorMmPerPx: number): number | null {
  if (points.length < 2) return null;
  const centroid: Point = {
    x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
    y: points.reduce((sum, p) => sum + p.y, 0) / points.length,
  };
  const avgPixelRadius = points.reduce((sum, p) => sum + distance(p, centroid), 0) / points.length;
  return avgPixelRadius * scaleFactorMmPerPx;
}

export function centroid(points: Point[]): Point | null {
  if (points.length === 0) return null;
  return {
    x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
    y: points.reduce((sum, p) => sum + p.y, 0) / points.length,
  };
}
