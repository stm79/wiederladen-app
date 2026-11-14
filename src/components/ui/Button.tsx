import Link from "next/link";
import { clsx } from "clsx";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "dangerGhost";
type Size = "sm" | "md";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-neutral-900 text-white shadow-sm hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white",
  secondary:
    "border border-neutral-200 bg-white text-neutral-800 shadow-xs hover:bg-neutral-50 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800",
  danger: "bg-red-600 text-white shadow-sm hover:bg-red-700",
  ghost:
    "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
  dangerGhost: "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "h-8 gap-1.5 px-2.5 text-[13px]",
  md: "h-10 gap-2 px-4 text-sm",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return clsx(
    "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-lg font-medium transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
    "disabled:pointer-events-none disabled:opacity-50",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className
  );
}

interface CommonProps {
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  children?: ReactNode;
}

export function Button({
  variant,
  size,
  icon,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & CommonProps) {
  return (
    <button className={buttonClasses({ variant, size, className })} {...props}>
      {icon && <Icon name={icon} size={size === "sm" ? 15 : 17} />}
      {children}
    </button>
  );
}

/** A Next.js link that looks like a button (instead of nesting <button> in <a>). */
export function LinkButton({
  href,
  variant,
  size,
  icon,
  className,
  children,
  external,
  ...props
}: CommonProps & { href: string; className?: string; external?: boolean } & Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    "href"
  >) {
  const content = (
    <>
      {icon && <Icon name={icon} size={size === "sm" ? 15 : 17} />}
      {children}
    </>
  );
  const cls = buttonClasses({ variant, size, className });
  // API routes (downloads, PDFs) must be plain anchors — client-side
  // navigation would try to render them as pages.
  if (external) {
    return (
      <a href={href} className={cls} {...props}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...props}>
      {content}
    </Link>
  );
}
