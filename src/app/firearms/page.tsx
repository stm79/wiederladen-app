import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { EmptyState, PageHeader } from "@/components/ui/Layout";

export const dynamic = "force-dynamic";

export default async function FirearmsPage() {
  const firearms = await prisma.firearm.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { loads: true, sessionFirearms: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Waffen"
        actions={
          <LinkButton href="/firearms/new" icon="plus">
            Neue Waffe
          </LinkButton>
        }
      />

      {firearms.length === 0 ? (
        <EmptyState
          icon="crosshair"
          title="Noch keine Waffe angelegt"
          description="Lege zuerst eine Waffe an, um Ladedaten zuzuordnen."
          action={
            <LinkButton href="/firearms/new" icon="plus">
              Neue Waffe
            </LinkButton>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {firearms.map((firearm) => (
            <Link
              key={firearm.id}
              href={`/firearms/${firearm.id}`}
              className="group flex flex-col gap-4 rounded-xl border border-neutral-200/80 bg-white p-5 shadow-xs transition-colors hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 group-hover:text-brand dark:bg-neutral-800 dark:text-neutral-400">
                  <Icon name="crosshair" size={19} />
                </span>
                <div className="min-w-0">
                  <div className="truncate font-semibold">{firearm.name}</div>
                  <div className="truncate text-sm text-neutral-500 dark:text-neutral-400">{firearm.caliber}</div>
                </div>
              </div>
              <div className="flex gap-4 border-t border-neutral-100 pt-3 text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                <span>
                  <span className="font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
                    {firearm._count.loads}
                  </span>{" "}
                  Ladedaten
                </span>
                <span>
                  <span className="font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
                    {firearm._count.sessionFirearms}
                  </span>{" "}
                  Sessions
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
