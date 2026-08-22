import Link from "next/link";
import { prisma } from "@/lib/prisma";

// Aggregates counts across entities touched by every phase's mutations;
// simpler to always render fresh than to wire revalidatePath("/") into each one.
export const dynamic = "force-dynamic";

async function getCounts() {
  const [firearms, loads, sessions] = await Promise.all([
    prisma.firearm.count(),
    prisma.load.count(),
    prisma.session.count(),
  ]);
  return { firearms, loads, sessions };
}

async function getRecentLoads() {
  const loads = await prisma.load.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { firearm: true },
  });

  return loads.map((load) => ({
    id: load.id,
    label: load.name ?? (load.powder || "Ladung"),
    firearmName: load.firearm.name,
  }));
}

function Tile({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-neutral-200 p-4 hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
    >
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-sm text-neutral-500">{label}</div>
    </Link>
  );
}

export default async function DashboardPage() {
  const [counts, recentLoads] = await Promise.all([getCounts(), getRecentLoads()]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Tile label="Waffen" value={counts.firearms} href="/firearms" />
        <Tile label="Ladedaten" value={counts.loads} href="/loads" />
        <Tile label="Sessions" value={counts.sessions} href="/sessions" />
      </div>

      {counts.firearms === 0 ? (
        <p className="text-sm text-neutral-500">
          Willkommen! Lege zunächst eine{" "}
          <Link href="/firearms/new" className="underline">
            Waffe
          </Link>{" "}
          an, um mit der Erfassung von Ladedaten zu beginnen.
        </p>
      ) : recentLoads.length > 0 ? (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Letzte Ladedaten</h2>
          <div className="flex flex-col divide-y divide-neutral-200 rounded-lg border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
            {recentLoads.map((load) => (
              <Link
                key={load.id}
                href={`/loads/${load.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-900"
              >
                <span className="font-medium">{load.label}</span>
                <span className="text-sm text-neutral-500">{load.firearmName}</span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
