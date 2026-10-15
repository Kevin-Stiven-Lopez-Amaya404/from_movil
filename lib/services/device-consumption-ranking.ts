
import {
  consumptionService,
  type ConsumptionRangeQuery,
} from "@/lib/services/consumption-service";
import { smartHomeService } from "@/lib/services/smart-home-service";

export type DeviceConsumptionRankingItem = {
  deviceId: string;
  deviceName: string;
  totalEnergyDeltaKwh: number;
  readingsCount: number;
};

export type DeviceConsumptionRankingResult = {
  deviceCount: number;
  measuredDeviceCount: number;
  topDevices: DeviceConsumptionRankingItem[];
};

export async function loadDeviceConsumptionRanking(
  homeId: string,
  query?: ConsumptionRangeQuery,
): Promise<DeviceConsumptionRankingResult> {
  const listedDevices = await smartHomeService.listDevices(homeId);

  const homeDevices = listedDevices.filter(
    (device) => device.homeId === homeId,
  );

  const summaries: DeviceConsumptionRankingItem[] = [];

  // Consultar máximo cinco dispositivos simultáneamente.
  for (let index = 0; index < homeDevices.length; index += 5) {
    const batch = homeDevices.slice(index, index + 5);

    const results = await Promise.all(
      batch.map(async (device) => {
        const summary = await consumptionService.getDeviceSummary(
          homeId,
          device.id,
          query,
        );

        if (
          summary.homeId !== homeId ||
          summary.deviceId !== device.id ||
          !Number.isInteger(summary.readingsCount) ||
          summary.readingsCount < 0 ||
          !Number.isFinite(summary.totalEnergyDeltaKwh) ||
          summary.totalEnergyDeltaKwh < 0
        ) {
          throw new Error(
            "El backend devolvió un resumen de consumo inválido.",
          );
        }

        return {
          deviceId: device.id,
          deviceName: device.name,
          totalEnergyDeltaKwh: summary.totalEnergyDeltaKwh,
          readingsCount: summary.readingsCount,
        };
      }),
    );

    summaries.push(...results);
  }

  const topDevices = summaries
    .filter(
      (device) =>
        device.readingsCount > 0 &&
        device.totalEnergyDeltaKwh > 0,
    )
    .sort(
      (a, b) =>
        b.totalEnergyDeltaKwh - a.totalEnergyDeltaKwh,
    )
    .slice(0, 5);

  return {
    deviceCount: homeDevices.length,
    measuredDeviceCount: summaries.filter(
      (device) => device.readingsCount > 0,
    ).length,
    topDevices,
  };
}