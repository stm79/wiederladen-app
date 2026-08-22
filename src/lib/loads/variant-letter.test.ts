import { describe, expect, it } from "vitest";
import { indexToVariantLetter, formatLoadNumber } from "./variant-letter";

describe("indexToVariantLetter", () => {
  it("produces A, B, C... for the first 26 indices", () => {
    expect(indexToVariantLetter(0)).toBe("A");
    expect(indexToVariantLetter(1)).toBe("B");
    expect(indexToVariantLetter(25)).toBe("Z");
  });

  it("rolls over to AA, AB... past 26", () => {
    expect(indexToVariantLetter(26)).toBe("AA");
    expect(indexToVariantLetter(27)).toBe("AB");
    expect(indexToVariantLetter(51)).toBe("AZ");
    expect(indexToVariantLetter(52)).toBe("BA");
  });
});

describe("formatLoadNumber", () => {
  it("zero-pads the number to 3 digits and appends the letter", () => {
    expect(formatLoadNumber(3, "A")).toBe("#003A");
    expect(formatLoadNumber(42, "B")).toBe("#042B");
    expect(formatLoadNumber(1000, "A")).toBe("#1000A");
  });

  it("omits the letter when there is no variant", () => {
    expect(formatLoadNumber(3, "")).toBe("#003");
    expect(formatLoadNumber(42, "  ")).toBe("#042");
  });
});
