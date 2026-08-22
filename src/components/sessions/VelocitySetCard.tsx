import { UnitValueDisplay } from "@/components/units/UnitValueDisplay";
import { VelocitySetDeleteButton } from "@/components/sessions/VelocitySetDeleteButton";
import { VelocityShotChart } from "@/components/charts/VelocityShotChart";

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
    <div className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
      <div className="flex items-start justify-between">
        <div>
          {loadLabel !== undefined && <div className="font-medium">{loadLabel ?? "Ohne Ladung"}</div>}
          <div className="text-sm text-neutral-500">
            {velocitySet.sourceDevice} · {velocitySet.shots.length} Schuss
          </div>
        </div>
        <VelocitySetDeleteButton id={velocitySet.id} />
      </div>
      <div className="flex gap-6 text-sm">
        <div>
          <div className="text-neutral-500">Ø</div>
          <UnitValueDisplay kind="velocity" value={velocitySet.avgMps} />
        </div>
        <div>
          <div className="text-neutral-500">SD</div>
          <UnitValueDisplay kind="velocity" value={velocitySet.sdMps} />
        </div>
        <div>
          <div className="text-neutral-500">ES</div>
          <UnitValueDisplay kind="velocity" value={velocitySet.esMps} />
        </div>
      </div>
      <VelocityShotChart shots={velocitySet.shots} />
    </div>
  );
}
