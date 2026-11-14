const DATE = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
const DATE_LONG = new Intl.DateTimeFormat("de-DE", { weekday: "short", day: "numeric", month: "long", year: "numeric" });

/** "14.06.2026" */
export function formatDate(date: Date): string {
  return DATE.format(date);
}

/** "So., 14. Juni 2026" */
export function formatDateLong(date: Date): string {
  return DATE_LONG.format(date);
}
