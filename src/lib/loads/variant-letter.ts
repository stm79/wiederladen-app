/** Spreadsheet-style base-26 letter sequence: 0->A, 1->B, ..., 25->Z, 26->AA, ... */
export function indexToVariantLetter(index: number): string {
  let n = index;
  let result = "";
  do {
    result = String.fromCharCode(65 + (n % 26)) + result;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return result;
}

export function formatLoadNumber(loadNumber: number, variantLetter: string): string {
  return `#${String(loadNumber).padStart(3, "0")}${variantLetter.trim()}`;
}
