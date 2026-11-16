"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Icon, type IconName } from "@/components/ui/Icon";

const NAV_ITEMS: { href: string; label: string; short?: string; icon: IconName }[] = [
  { href: "/", label: "Übersicht", icon: "home" },
  { href: "/loads", label: "Ladedaten", icon: "flask" },
  { href: "/sessions", label: "Sessions", icon: "calendar" },
  { href: "/firearms", label: "Waffen", icon: "crosshair" },
  { href: "/cases", label: "Hülsen", icon: "cartridge" },
  { href: "/compare", label: "Vergleich", icon: "chart" },
];

const SETTINGS = { href: "/settings", label: "Einstellungen", icon: "settings" as const };

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight text-neutral-900 dark:text-white">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-brand dark:bg-white/10">
        <Icon name="crosshair" size={17} />
      </span>
      Wiederladen
    </Link>
  );
}

function SidebarLink({ href, label, icon, active }: { href: string; label: string; icon: IconName; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={clsx(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-white text-neutral-900 shadow-xs ring-1 ring-neutral-200 dark:bg-neutral-800 dark:text-white dark:ring-neutral-700"
          : "text-neutral-600 hover:bg-neutral-200/50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-white"
      )}
    >
      <Icon name={icon} size={18} className={active ? "text-brand" : undefined} />
      {label}
    </Link>
  );
}

export function NavBar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-6 border-r border-neutral-200/80 px-3 py-5 md:flex dark:border-neutral-800">
        <div className="px-2">
          <Logo />
        </div>
        <div className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <SidebarLink key={item.href} {...item} active={isActive(pathname, item.href)} />
          ))}
        </div>
        <div className="mt-auto">
          <SidebarLink {...SETTINGS} active={isActive(pathname, SETTINGS.href)} />
        </div>
      </nav>

      {/* Mobile top bar */}
      <div className="app-chrome sticky top-0 z-20 flex h-14 items-center justify-between border-b border-neutral-200/80 bg-background/90 px-4 backdrop-blur md:hidden dark:border-neutral-800">
        <Logo />
        <Link
          href={SETTINGS.href}
          aria-label={SETTINGS.label}
          className={clsx(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            isActive(pathname, SETTINGS.href)
              ? "bg-neutral-200/70 text-neutral-900 dark:bg-neutral-800 dark:text-white"
              : "text-neutral-500 hover:bg-neutral-200/50 dark:hover:bg-neutral-800"
          )}
        >
          <Icon name="settings" size={19} />
        </Link>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-neutral-200/80 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden dark:border-neutral-800 dark:bg-neutral-950/95">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "flex flex-1 flex-col items-center gap-1 pb-2 pt-2.5 text-[11px] font-medium",
                active ? "text-neutral-900 dark:text-white" : "text-neutral-500 dark:text-neutral-400"
              )}
            >
              <Icon name={item.icon} size={21} className={active ? "text-brand" : undefined} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
