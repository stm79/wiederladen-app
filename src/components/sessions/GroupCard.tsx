"use client";

import { useState } from "react";
import Link from "next/link";
import { UnitValueDisplay } from "@/components/units/UnitValueDisplay";
import { ImageUploadForm } from "@/components/forms/ImageUploadForm";
import { ShotGroupForm } from "@/components/forms/ShotGroupForm";
import { GroupDeleteButton } from "@/components/sessions/GroupDeleteButton";
import { ImageDeleteButton } from "@/components/sessions/ImageDeleteButton";
import { VelocitySetCard } from "@/components/sessions/VelocitySetCard";
import { Button } from "@/components/ui/Button";

interface GroupCardProps {
  sessionId: string;
  group: {
    id: string;
    loadId: string | null;
    distanceM: number | null;
    extremeSpreadMm: number | null;
    meanRadiusMm: number | null;
    shotCount: number | null;
    source: string;
    notes: string | null;
    images: { id: string; filePath: string }[];
    velocitySets: {
      id: string;
      sourceDevice: string;
      rawFileName: string | null;
      avgMps: number | null;
      sdMps: number | null;
      esMps: number | null;
      shots: { id: string; shotNumber: number; velocityMps: number }[];
    }[];
  };
  loadLabel: string | null;
  loads: { id: string; name: string | null; caliber: string; bulletWeightGr: number | null; bullet: string | null }[];
}

export function GroupCard({ sessionId, group, loadLabel, loads }: GroupCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <ShotGroupForm sessionId={sessionId} loads={loads} group={group} onDone={() => setIsEditing(false)} />
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-medium">{loadLabel ?? "Ohne Ladung"}</div>
          <div className="text-sm text-neutral-500">
            {group.distanceM ? `${group.distanceM} m · ` : ""}
            {group.shotCount ? `${group.shotCount} Schuss` : ""}
          </div>
        </div>
        <span
          className={
            group.source === "calibrated"
              ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
              : "rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
          }
        >
          {group.source === "calibrated" ? "vermessen" : "manuell"}
        </span>
      </div>

      <div className="flex gap-6 text-sm">
        <div>
          <div className="text-neutral-500">Extreme Spread</div>
          <UnitValueDisplay kind="length" value={group.extremeSpreadMm} />
        </div>
        <div>
          <div className="text-neutral-500">Mean Radius</div>
          <UnitValueDisplay kind="length" value={group.meanRadiusMm} />
        </div>
      </div>

      {group.notes && <p className="text-sm text-neutral-600 dark:text-neutral-400">{group.notes}</p>}

      {group.images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {group.images.map((image) => (
            <div key={image.id} className="group relative">
              <Link href={`/sessions/${sessionId}/groups/${group.id}/measure?imageId=${image.id}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/uploads/${image.filePath}`}
                  alt="Schussgruppe"
                  className="h-24 w-24 rounded-md object-cover"
                />
              </Link>
              <div className="absolute right-1 top-1">
                <ImageDeleteButton id={image.id} />
              </div>
            </div>
          ))}
        </div>
      )}

      {group.velocitySets.length > 0 && (
        <div className="flex flex-col gap-2">
          {group.velocitySets.map((velocitySet) => (
            <VelocitySetCard key={velocitySet.id} velocitySet={velocitySet} />
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ImageUploadForm groupId={group.id} />
          <Link href={`/chrono/import?groupId=${group.id}`}>
            <Button type="button" variant="secondary">
              + Chrono-Daten importieren
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-xs text-neutral-500 hover:underline"
          >
            Bearbeiten
          </button>
          <GroupDeleteButton id={group.id} />
        </div>
      </div>
    </div>
  );
}
