/** German-locale (comma decimal) number formatting for the printed Dymo
 *  label — a physical label should stay fixed regardless of the app's live
 *  unit-display toggle, so this always uses grain/mm and comma decimals,
 *  independent of lib/units. Trims a trailing ",00" for whole numbers. */
export function labelNumber(value: number, digits: number): string {
  const fixed = value.toFixed(digits);
  const trimmed = digits > 0 && /^-?\d+\.0+$/.test(fixed) ? value.toFixed(0) : fixed;
  return trimmed.replace(".", ",");
}

/** Brand prefixes long enough to push the actual powder code (N140, RS52,
 *  D032, …) past the label's text-ellipsis cutoff — the code alone already
 *  identifies the brand for these three (N-/RS-/D-/S- prefixed), so it's
 *  safe to drop. Longest-first so "Reload Swiss " doesn't leave "Reload ". */
const POWDER_LABEL_BRAND_PREFIXES = ["Reload Swiss ", "Vihtavuori ", "Lovex "];

/** Strips a known brand prefix so the label shows the decisive powder code
 *  first instead of it being truncated off the end. Unrecognized/custom
 *  powder names pass through unchanged. */
export function labelPowder(powder: string | null): string {
  if (!powder) return "–";
  const prefix = POWDER_LABEL_BRAND_PREFIXES.find((p) => powder.startsWith(p));
  return prefix ? powder.slice(prefix.length) : powder;
}
