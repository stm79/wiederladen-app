/** Formats a Date as the yyyy-mm-dd string an `<input type="date">` expects. */
export function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}
