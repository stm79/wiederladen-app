"use client";

import { useState } from "react";
import Link from "next/link";
import { UnitValueDisplay } from "@/components/units/UnitValueDisplay";
import { ImageUploadForm } from "@/components/forms/ImageUploadForm";
import { ShotGroupForm, type ShotGroupLoadOption } from "@/components/forms/ShotGroupForm";
import { GroupDeleteButton } from "@/components/sessions/GroupDeleteButton";
import { ImageDeleteButton } from "@/components/sessions/ImageDeleteButton";
import { VelocitySetCard } from "@/components/sessions/VelocitySetCard";
import { Button, LinkButton } from "@/components/ui/Button";
import { Badge, LoadNumberBadge, Stat } from "@/components/ui/Layout";
import { Icon } from "@/components/ui/Icon";
import { loadDisplayName } from "@/lib/loads/label";
import { formatLoadNumber } from "@/lib/loads/variant-letter";

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
  load: ShotGroupLoadOption | null;
  loads: ShotGroupLoadOption[];
}

export function GroupCard({ sessionId, group, load, loads }: GroupCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <ShotGroupForm sessionId={sessionId} loads={loads} group={group} onDone={() => setIsEditing(false)} />
    );
  }

  const measureHref = (imageId?: string) =>
    `/sessions/${sessionId}/groups/${group.id}/measure${imageId ? `?imageId=${imageId}` : ""}`;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-start justify-between gap-3 p-4 pb-0 sm:p-5 sm:pb-0">
        <div className="min-w-0 flex-1">
          {load ? (
            <Link href={`/loads/${load.id}`} className="group flex items-center gap-2">
              <LoadNumberBadge>{formatLoadNumber(load.loadNumber, load.variantLetter)}</LoadNumberBadge>
              <span className="truncate font-semibold group-hover:underline">{loadDisplayName(load)}</span>
            </Link>
          ) : (
            <span className="font-semibold text-neutral-500">Ohne Ladung</span>
          )}
          <div className="mt-1.5 flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
            {[group.distanceM ? `${group.distanceM} m` : null, group.shotCount ? `${group.shotCount} Schuss` : null]
              .filter(Boolean)
              .join(" · ") || "Keine Angaben"}
            <Badge tone={group.source === "calibrated" ? "success" : "neutral"}>
              {group.source === "calibrated" ? "vermessen" : "manuell"}
            </Badge>
          </div>
        </div>
        <div className="-mr-2 -mt-1 flex shrink-0 items-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-8 px-0"
            onClick={() => setIsEditing(true)}
            aria-label="Gruppe bearbeiten"
            title="Bearbeiten"
          >
            <Icon name="pencil" size={15} />
          </Button>
          <GroupDeleteButton id={group.id} />
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4 sm:p-5">
        <div className="grid grid-cols-2 gap-4 rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800/50">
          <Stat label="Extreme Spread">
            <UnitValueDisplay kind="length" value={group.extremeSpreadMm} />
          </Stat>
          <Stat label="Mean Radius">
            <UnitValueDisplay kind="length" value={group.meanRadiusMm} />
          </Stat>
        </div>

        {group.notes && <p className="whitespace-pre-line text-sm text-neutral-600 dark:text-neutral-400">{group.notes}</p>}

        {group.images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {group.images.map((image) => (
              <div key={image.id} className="group/img relative">
                <Link href={measureHref(image.id)} title="Gruppe auf dem Foto vermessen">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/uploads/${image.filePath}`}
                    alt="Schussgruppe"
                    className="h-24 w-24 rounded-lg object-cover ring-1 ring-neutral-200 transition group-hover/img:ring-2 group-hover/img:ring-brand dark:ring-neutral-700"
                  />
                  <span className="absolute inset-x-1 bottom-1 flex items-center justify-center gap-1 rounded-md bg-black/60 py-0.5 text-[10px] font-medium text-white">
                    <Icon name="ruler" size={11} />
                    Vermessen
                  </span>
                </Link>
                <div className="absolute right-1 top-1">
                  <ImageDeleteButton id={image.id} />
                </div>
              </div>
            ))}
          </div>
        )}

        {group.velocitySets.length > 0 && (
          <div className="flex flex-col gap-3">
            {group.velocitySets.map((velocitySet) => (
              <VelocitySetCard key={velocitySet.id} velocitySet={velocitySet} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto flex flex-wrap gap-2 border-t border-neutral-100 bg-neutral-50/60 px-4 py-3 sm:px-5 dark:border-neutral-800 dark:bg-neutral-900">
        <ImageUploadForm groupId={group.id} />
        <LinkButton href={`/chrono/import?groupId=${group.id}`} variant="secondary" size="sm" icon="activity">
          Chrono-Daten
        </LinkButton>
      </div>
    </div>
  );
}
