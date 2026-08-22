/** German-locale (comma decimal) number formatting for the printed Dymo
 *  label — a physical label should stay fixed regardless of the app's live
 *  unit-display toggle, so this always uses grain/mm and comma decimals,
 *  independent of lib/units. Trims a trailing ",00" for whole numbers. */
export function labelNumber(value: number, digits: number): string {
  const fixed = value.toFixed(digits);
  const trimmed = digits > 0 && /^-?\d+\.0+$/.test(fixed) ? value.toFixed(0) : fixed;
  return trimmed.replace(".", ",");
}
