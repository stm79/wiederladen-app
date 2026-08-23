/** Display name for a load: the user's own name if set, otherwise
 *  "Kaliber + Geschossgewicht + Geschoss" composed from the load's data. */
export function loadDisplayName(load: {
  name: string | null;
  caliber: string;
  bulletWeightGr: number | null;
  bullet: string | null;
}): string {
  if (load.name) return load.name;

  const parts = [load.caliber, load.bulletWeightGr != null ? `${load.bulletWeightGr}gr` : null, load.bullet].filter(
    (p): p is string => !!p
  );
  return parts.length > 0 ? parts.join(" ") : "Ladung";
}
