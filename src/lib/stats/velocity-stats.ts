export interface VelocityStats {
  avgMps: number;
  sdMps: number;
  esMps: number;
}

/** Sample standard deviation (n-1 denominator), standard for small chrono shot strings. */
export function computeVelocityStats(velocitiesMps: number[]): VelocityStats | null {
  if (velocitiesMps.length === 0) return null;

  const avg = velocitiesMps.reduce((sum, v) => sum + v, 0) / velocitiesMps.length;

  if (velocitiesMps.length === 1) {
    return { avgMps: avg, sdMps: 0, esMps: 0 };
  }

  const variance =
    velocitiesMps.reduce((sum, v) => sum + (v - avg) ** 2, 0) / (velocitiesMps.length - 1);
  const sd = Math.sqrt(variance);
  const es = Math.max(...velocitiesMps) - Math.min(...velocitiesMps);

  return { avgMps: avg, sdMps: sd, esMps: es };
}
