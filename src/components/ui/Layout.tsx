import Link from "next/link";
import { clsx } from "clsx";
import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

/** Top of every page: optional back link, title (+ optional leading badge),
 *  a muted subtitle line and right-aligned actions that wrap on small screens. */
export function PageHeader({
  title,
  badge,
  subtitle,
  back,
  actions,
  stackActions,
}: {
  title: ReactNode;
  badge?: ReactNode;
  subtitle?: ReactNode;
  back?: { href: string; label: string };
  actions?: ReactNode;
  /** Put the actions on their own row under the title (for long titles with
   *  several actions, where side-by-side would wrap awkwardly). */
  stackActions?: boolean;
}) {
  return (
    <header className="flex flex-col gap-4 print:hidden">
      {back && (
        <Link
          href={back.href}
          className="inline-flex w-fit items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          <Icon name="back" size={15} />
          {back.label}
        </Link>
      )}
      <div className={clsx("flex flex-col gap-4", !stackActions && "sm:flex-row sm:items-start sm:justify-between")}>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            {badge}
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">{title}</h1>
          </div>
          {subtitle && <div className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{subtitle}</div>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

export function Card({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-neutral-200/80 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900",
        padded && "p-4 sm:p-5",
        className
      )}
    >
      {children}
    </div>
  );
}

/** Titled block of a page. `card` wraps the body in a Card. */
export function Section({
  title,
  description,
  action,
  children,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={clsx("flex min-w-0 flex-col gap-3", className)}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-neutral-900 dark:text-white">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: IconName;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-neutral-300 px-6 py-10 text-center dark:border-neutral-700">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
        <Icon name={icon} size={20} />
      </div>
      <div>
        <p className="font-medium text-neutral-900 dark:text-neutral-100">{title}</p>
        {description && <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}

type BadgeTone = "neutral" | "brand" | "success";
const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
  brand: "bg-brand-soft text-brand-strong",
  success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
};

export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: BadgeTone; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums",
        BADGE_TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/** Load number pill, e.g. "#001A". */
export function LoadNumberBadge({ children, large }: { children: ReactNode; large?: boolean }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-md bg-brand-soft font-mono font-semibold tabular-nums text-brand-strong",
        large ? "px-2 py-1 text-sm" : "px-1.5 py-0.5 text-xs"
      )}
    >
      {children}
    </span>
  );
}

/** Small label-over-value pair for key figures. */
export function Stat({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={clsx("min-w-0", className)}>
      <div className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">{label}</div>
      <div className="mt-0.5 font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">{children}</div>
    </div>
  );
}

/** Small muted chip with an icon, for metadata like temperature or location. */
export function MetaChip({ icon, children }: { icon: IconName; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400">
      <Icon name={icon} size={15} className="text-neutral-400" />
      {children}
    </span>
  );
}

/** Divided list inside a card; rows are usually links. */
export function ListCard({ children }: { children: ReactNode }) {
  return (
    <div className="divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-xs dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
      {children}
    </div>
  );
}

export function ListRow({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
    >
      {children}
      <Icon
        name="chevronRight"
        size={16}
        className="ml-auto shrink-0 text-neutral-300 transition-colors group-hover:text-neutral-500 dark:text-neutral-600"
      />
    </Link>
  );
}
