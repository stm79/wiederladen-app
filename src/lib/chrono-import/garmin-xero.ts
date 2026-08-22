import Papa from "papaparse";
import type { ChronoParser, RawTable, VelocitySourceUnit } from "./types";

/**
 * Garmin Xero export — verified against real sample files (German-localized
 * device/app in the samples seen: header "Tempo (MPS)"/"Δ Durchschnitt (MPS)"/
 * "Leistungsfaktor"). Structure: a title line ("Gewehrkugel …"), the real
 * header row (leading BOM on the first cell), numbered shot rows with
 * comma-decimal quoted numbers ("822,6"), then a "-" separator row followed
 * by a summary block. One file = one shot string.
 */
export const garminXeroParser: ChronoParser = {
  id: "garmin-xero",
  label: "Garmin Xero C1/C1 Pro",
  detect(text, fileName) {
    const parsed = Papa.parse<string[]>(text, { skipEmptyLines: false }).data;

    const headerIdx = parsed.findIndex((row) => {
      const cells = row.map((c) => c.replace(/^﻿/, "").trim());
      const hasShotNumberCol = cells.some((c) => c === "#");
      const hasVelocityCol = cells.some((c) => /tempo|leistungsfaktor|geschwindigkeit/i.test(c));
      return hasShotNumberCol && hasVelocityCol;
    });
    if (headerIdx === -1) return null;

    const headerCells = parsed[headerIdx].map((c) => c.replace(/^﻿/, "").trim());
    const velocityColumn = headerCells.findIndex((c) => /tempo|geschwindigkeit|speed/i.test(c));
    const shotNumberColumn = headerCells.findIndex((c) => c === "#");
    if (velocityColumn === -1) return null;

    const unit: VelocitySourceUnit = /fps/i.test(headerCells[velocityColumn]) ? "fps" : "mps";

    const rows: string[][] = [];
    for (let i = headerIdx + 1; i < parsed.length; i++) {
      const row = parsed[i];
      const first = row[0]?.trim();
      if (!first || !/^\d+$/.test(first)) break; // stops at the "-" separator / summary section
      rows.push(row);
    }
    if (rows.length === 0) return null;

    const table: RawTable = { headers: headerCells, rows };

    return {
      series: [
        {
          id: "main",
          label: fileName,
          table,
          suggestedMapping: {
            shotNumberColumn: shotNumberColumn === -1 ? null : shotNumberColumn,
            velocityColumn,
            velocityUnit: unit,
          },
        },
      ],
    };
  },
};
