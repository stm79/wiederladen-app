import { fpsToMps } from "@/lib/units/conversions";
import type { ColumnMapping, ParsedShot, RawTable } from "./types";

/** Applies a column mapping to a raw parsed table, producing clean shots in
 *  canonical m/s. Rows with a non-numeric velocity cell are silently skipped
 *  (e.g. trailing blank rows, summary/footer rows some devices append). */
export function applyMapping(table: RawTable, mapping: ColumnMapping): ParsedShot[] {
  const shots: ParsedShot[] = [];
  let autoNumber = 1;

  for (const row of table.rows) {
    const rawVelocity = row[mapping.velocityColumn]?.trim();
    if (!rawVelocity) continue;
    const velocity = Number(rawVelocity.replace(",", "."));
    if (Number.isNaN(velocity)) continue;

    const velocityMps = mapping.velocityUnit === "fps" ? fpsToMps(velocity) : velocity;

    let shotNumber = autoNumber;
    if (mapping.shotNumberColumn != null) {
      const rawShotNumber = row[mapping.shotNumberColumn]?.trim();
      const parsed = rawShotNumber ? Number(rawShotNumber) : NaN;
      shotNumber = Number.isNaN(parsed) ? autoNumber : parsed;
    }

    shots.push({ shotNumber, velocityMps });
    autoNumber += 1;
  }

  return shots;
}
