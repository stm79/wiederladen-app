import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function SessionsPage() {
  const sessions = await prisma.session.findMany({
    orderBy: { date: "desc" },
    include: {
      firearm: true,
      _count: { select: { groups: true } },
      groups: { select: { _count: { select: { velocitySets: true } } } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Sessions</h1>
        <Link href="/sessions/new">
          <Button>+ Neue Session</Button>
        </Link>
      </div>

      {sessions.length === 0 ? (
        <p className="text-sm text-neutral-500">Noch keine Sessions erfasst.</p>
      ) : (
        <div className="flex flex-col divide-y divide-neutral-200 dark:divide-neutral-800">
          {sessions.map((session) => (
            <Link
              key={session.id}
              href={`/sessions/${session.id}`}
              className="flex items-center justify-between py-3 hover:bg-neutral-50 dark:hover:bg-neutral-900"
            >
              <div>
                <div className="font-medium">
                  {new Intl.DateTimeFormat("de-DE").format(session.date)}
                  {session.location ? ` – ${session.location}` : ""}
                </div>
                <div className="text-sm text-neutral-500">{session.firearm?.name ?? "—"}</div>
              </div>
              <div className="text-sm text-neutral-400">
                {session._count.groups} Gruppen ·{" "}
                {session.groups.reduce((sum, g) => sum + g._count.velocitySets, 0)} Chrono-Sätze
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
