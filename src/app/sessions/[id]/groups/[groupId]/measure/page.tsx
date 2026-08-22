import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GroupMeasurementCanvas } from "@/components/images/GroupMeasurementCanvas";
import type { Point } from "@/lib/group-measurement/metrics";

export default async function MeasureGroupPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; groupId: string }>;
  searchParams: Promise<{ imageId?: string }>;
}) {
  const { id: sessionId, groupId } = await params;
  const { imageId } = await searchParams;

  const group = await prisma.shotGroup.findUnique({
    where: { id: groupId },
    include: { images: { orderBy: { createdAt: "asc" } } },
  });

  if (!group || group.sessionId !== sessionId) notFound();

  const image = imageId ? group.images.find((i) => i.id === imageId) : group.images[0];

  if (!image) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold">Schussgruppe vermessen</h1>
        <p className="text-sm text-neutral-500">
          Für diese Gruppe wurde noch kein Bild hochgeladen.
        </p>
        <Link href={`/sessions/${sessionId}`} className="text-sm underline">
          Zurück zur Session
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Schussgruppe vermessen</h1>
        <Link href={`/sessions/${sessionId}`} className="text-sm text-neutral-500 underline">
          Zurück zur Session
        </Link>
      </div>

      {group.images.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {group.images.map((img) => (
            <Link
              key={img.id}
              href={`/sessions/${sessionId}/groups/${groupId}/measure?imageId=${img.id}`}
              className={
                img.id === image.id
                  ? "rounded-md border border-neutral-900 px-2 py-1 text-xs dark:border-white"
                  : "rounded-md border border-neutral-200 px-2 py-1 text-xs text-neutral-500 dark:border-neutral-800"
              }
            >
              Bild {group.images.indexOf(img) + 1}
            </Link>
          ))}
        </div>
      )}

      <GroupMeasurementCanvas
        sessionId={sessionId}
        groupId={groupId}
        image={{
          id: image.id,
          filePath: image.filePath,
          width: image.width ?? 1000,
          height: image.height ?? 1000,
          calibration: image.calibration ? (JSON.parse(image.calibration) as GroupMeasurementCanvasCalibration) : null,
          shotPoints: image.shotPoints ? (JSON.parse(image.shotPoints) as Point[]) : null,
        }}
      />
    </div>
  );
}

type GroupMeasurementCanvasCalibration = { p1: Point; p2: Point; realDistanceMm: number };
