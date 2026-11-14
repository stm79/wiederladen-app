import { clsx } from "clsx";
import type { ReactNode } from "react";

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={clsx("flex min-w-0 flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label}
      </label>
      {children}
      {hint && !error && <span className="text-xs text-neutral-500 dark:text-neutral-400">{hint}</span>}
      {error && <span className="text-xs font-medium text-red-600 dark:text-red-400">{error}</span>}
    </div>
  );
}

/** A titled group of fields inside a form, rendered as a card. */
export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="@container rounded-xl border border-neutral-200/80 bg-white p-4 shadow-xs sm:p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{description}</p>}
      </div>
      {/* Container query (not viewport): the same form can sit in a narrow side
          column, e.g. the firearm form next to its loads list. */}
      <div className="grid grid-cols-1 gap-4 @md:grid-cols-2">{children}</div>
    </section>
  );
}

/** Save/cancel row. `sticky` keeps it visible at the bottom of long forms
 *  (above the mobile tab bar). */
export function FormActions({
  children,
  error,
  sticky,
}: {
  children: ReactNode;
  error?: string | null;
  sticky?: boolean;
}) {
  return (
    <div
      className={clsx(
        "flex flex-col gap-2",
        sticky &&
          "sticky bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-10 -mx-1 rounded-xl border border-neutral-200/80 bg-white/90 p-3 shadow-lg backdrop-blur md:bottom-4 dark:border-neutral-800 dark:bg-neutral-900/90"
      )}
    >
      {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export const inputClass =
  "h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 shadow-xs transition-colors placeholder:text-neutral-400 " +
  "focus:border-brand focus:outline-none focus:ring-3 focus:ring-brand/20 disabled:opacity-60 " +
  "dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500";

/** Same look as inputClass for multi-line fields (no fixed height). */
export const textareaClass = inputClass.replace("h-10 ", "") + " py-2";

/** Scrollable bordered box holding a list of checkbox rows. */
export const checkboxListClass =
  "flex max-h-56 flex-col overflow-y-auto rounded-lg border border-neutral-300 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-950";

export const checkboxRowClass =
  "flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900";
