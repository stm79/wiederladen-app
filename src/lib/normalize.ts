/** Converts "" / whitespace-only strings to null so `?? "—"` display fallbacks
 *  work consistently instead of rendering blank for form fields left empty. */
export function normalizeEmptyStrings<T extends Record<string, unknown>>(
  obj: T,
  keys: readonly (keyof T)[]
): T {
  const result = { ...obj };
  for (const key of keys) {
    const value = result[key];
    if (typeof value === "string") {
      const trimmed = value.trim();
      result[key] = (trimmed === "" ? null : trimmed) as T[typeof key];
    }
  }
  return result;
}
