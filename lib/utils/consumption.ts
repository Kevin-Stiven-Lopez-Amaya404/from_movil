import type { SmartDevice } from "@/lib/context/smart-home-context";

export type ConsumptionGoalStatus = "within" | "warning" | "exceeded";

export type ConsumptionGoalProgress = {
  consumedWh: number;
  percentage: number;
  progress: number;
  status: ConsumptionGoalStatus;
};

export const CONSUMPTION_WARNING_PERCENTAGE = 80;

/** Suma la energía acumulada de todos los dispositivos de un hogar. */
export function getHouseConsumption(
  devices: readonly SmartDevice[],
  homeId: string,
): number {
  return devices
    .filter((device) => device.homeId === homeId)
    .reduce((total, device) => total + Math.max(device.energy, 0), 0);
}

/** Convierte consumo y meta en un estado reutilizable para tarjetas y alertas. */
export function getConsumptionGoalProgress(
  consumedWh: number,
  targetWh: number,
): ConsumptionGoalProgress {
  const safeConsumedWh = Math.max(consumedWh, 0);
  const safeTargetWh = Math.max(targetWh, 1);
  const percentage = (safeConsumedWh / safeTargetWh) * 100;

  return {
    consumedWh: safeConsumedWh,
    percentage,
    progress: Math.min(percentage, 100),
    status:
      percentage >= 100
        ? "exceeded"
        : percentage >= CONSUMPTION_WARNING_PERCENTAGE
          ? "warning"
          : "within",
  };
}
