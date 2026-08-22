import type { ChronoParser, RawTable, VelocitySourceUnit } from "./types";

/**
 * LabRadar "SR000X Report.csv" export — verified against real sample files.
 * Format: `sep=;` directive, a metadata block (Device ID, Series No, Total
 * number of shots, Units velocity, Stats - ...), then a shot table header
 * `Shot ID;V0;V10;V20;V30;V40;V50;Ke0;...`. We use V0 (muzzle velocity) as
 * the shot velocity; V10+ are downrange gates and read 0 when the radar lost
 * the signal at that gate, so they're not reliable as "the" velocity.
 * One file = one series (no multi-series bundling like MagnetoSpeed).
 */
export const labradarParser: ChronoParser = {
  id: "labradar",
  label: "LabRadar",
  detect(text) {
    const lines = text.split(/\r?\n/);
    const looksLikeLabRadar = lines.some((l) => l.trim().startsWith("Device ID;LBR"));
    if (!looksLikeLabRadar) return null;

    const headerIdx = lines.findIndex((l) => l.trim().startsWith("Shot ID;"));
    if (headerIdx === -1) return null;

    const headerCells = lines[headerIdx].split(";").map((c) => c.trim());
    const velocityColumn = headerCells.indexOf("V0");
    const shotIdColumn = headerCells.indexOf("Shot ID");
    if (velocityColumn === -1 || shotIdColumn === -1) return null;

    const unitLine = lines.find((l) => l.trim().startsWith("Units velocity"));
    const unit: VelocitySourceUnit = unitLine && /fps/i.test(unitLine) ? "fps" : "mps";

    const seriesLine = lines.find((l) => l.trim().startsWith("Series No"));
    const seriesNo = seriesLine?.split(";")[1]?.trim();

    const rows: string[][] = [];
    for (let i = headerIdx + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cells = line.split(";").map((c) => c.trim());
      if (cells.length < headerCells.length || !cells[shotIdColumn]) continue;
      rows.push(cells);
    }
    if (rows.length === 0) return null;

    const table: RawTable = { headers: headerCells, rows };

    return {
      series: [
        {
          id: "main",
          label: seriesNo ? `Serie ${seriesNo} (${rows.length} Schuss)` : `${rows.length} Schuss`,
          table,
          suggestedMapping: { shotNumberColumn: shotIdColumn, velocityColumn, velocityUnit: unit },
        },
      ],
    };
  },
};
