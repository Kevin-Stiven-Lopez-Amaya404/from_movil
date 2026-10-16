import type { SmartDevice } from "@/lib/domain/device";

type HomeReference = {
  id: string;
  name: string;
};

type LoadStatus = "loading" | "loaded" | "error";

export type ActiveDeviceAlert = {
  id: string;
  kind: "device";
  homeId: string;
  deviceId: string;
  title: string;
  description: string;
  icon: "cloud-offline-outline";
  tone: "warning";
};

export function getActiveDeviceAlerts(
  devices: readonly SmartDevice[],
  homes: readonly HomeReference[],
  loadStatuses: Readonly<Record<string, LoadStatus | undefined>>,
): ActiveDeviceAlert[] {
  const homesById = new Map(homes.map((home) => [home.id, home]));
  const alerts: ActiveDeviceAlert[] = [];
  const processedDevices = new Set<string>();

  for (const device of devices) {
    const home = homesById.get(device.homeId);

    if (!home || loadStatuses[home.id] !== "loaded") continue;
    if (device.connectivityStatus !== "OFFLINE") continue;

    const key = `${home.id}:${device.id}`;
    if (processedDevices.has(key)) continue;
    processedDevices.add(key);

    alerts.push({
      id: `device-offline:${key}`,
      kind: "device",
      homeId: home.id,
      deviceId: device.id,
      title: `${device.name} está desconectado`,
      description: `El dispositivo registra estado OFFLINE en ${home.name}.`,
      icon: "cloud-offline-outline",
      tone: "warning",
    });
  }

  return alerts;
}
