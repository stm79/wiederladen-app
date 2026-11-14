import { UnitValueDisplay } from "@/components/units/UnitValueDisplay";
import { VelocitySetDeleteButton } from "@/components/sessions/VelocitySetDeleteButton";
import { VelocityShotChart } from "@/components/charts/VelocityShotChart";
import { Stat } from "@/components/ui/Layout";
import { Icon } from "@/components/ui/Icon";

interface VelocitySetCardProps {
  velocitySet: {
    id: string;
    sourceDevice: string;
    rawFileName: string | null;
    avgMps: number | null;
    sdMps: number | null;
    esMps: number | null;
    shots: { id: string; shotNumber: number; velocityMps: number }[];
  };
  loadLabel?: string | null;
}

export function VelocitySetCard({ velocitySet, loadLabel }: VelocitySetCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-neutral-200/80 p-3 dark:border-neutral-800">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {loadLabel !== undefined && <div className="font-medium">{loadLabel ?? "Ohne Ladung"}</div>}
          <div className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            <Icon name="activity" size={14} />
            <span className="truncate">
              {velocitySet.sourceDevice} · {velocitySet.shots.length} Schuss
            </span>
          </div>
        </div>
        <VelocitySetDeleteButton id={velocitySet.id} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Ø">
          <UnitValueDisplay kind="velocity" value={velocitySet.avgMps} fractionDigits={1} />
        </Stat>
        <Stat label="SD">
          <UnitValueDisplay kind="velocity" value={velocitySet.sdMps} fractionDigits={1} />
        </Stat>
        <Stat label="ES">
          <UnitValueDisplay kind="velocity" value={velocitySet.esMps} fractionDigits={1} />
        </Stat>
      </div>
      <VelocityShotChart shots={velocitySet.shots} />
    </div>
  );
}
