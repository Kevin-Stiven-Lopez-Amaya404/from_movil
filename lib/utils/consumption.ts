import type { SmartDevice } from "@/lib/domain/device";

export type ConsumptionGoalStatus = "within" | "warning" | "exceeded";

export type ConsumptionGoalProgress = {
  consumedWh: number;
  percentage: number;
  progress: number;
  status: ConsumptionGoalStatus;
};

export const CONSUMPTION_WARNING_PERCENTAGE = 80;

/** Adds up the accumulated energy of every device of a home. */
export function getHouseConsumption(
  devices: readonly SmartDevice[],
  homeId: string,
): number {
  return devices
    .filter((device) => device.homeId === homeId)
    .reduce((total, device) => total + Math.max(device.energy, 0), 0);
}

/** Turns consumption and target into a reusable state for cards and alerts. */
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
