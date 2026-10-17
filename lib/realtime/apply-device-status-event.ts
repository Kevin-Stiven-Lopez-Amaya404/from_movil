
import type { SmartDevice } from "@/lib/domain/device";
import type { DeviceStatusUpdatedEvent } from "@/lib/services/realtime-service";

/**
 * Aplica un evento de estado recibido por Socket.IO.
 * No modifica los objetos originales ni inventa estados de conexión.
 */
export function applyDeviceStatusEvent(
  devices: SmartDevice[],
  event: DeviceStatusUpdatedEvent,
): SmartDevice[] {
  const deviceId = event.deviceId ?? event.id;

  if (!deviceId || !devices.some((device) => device.id === deviceId)) {
    return devices;
  }

  return devices.map((device) => {
    if (device.id !== deviceId) return device;

    return {
      ...device,
      ...(event.homeId ? { homeId: event.homeId } : {}),
      ...(event.currentPowerW !== undefined
        ? { power: event.currentPowerW ?? 0 }
        : {}),
      ...(event.energyTotalKwh !== undefined
        ? { energy: (event.energyTotalKwh ?? 0) * 1000 }
        : {}),
      ...(event.voltageV !== undefined
        ? { voltage: event.voltageV ?? 0 }
        : {}),
      ...(event.currentA !== undefined
        ? { current: event.currentA ?? 0 }
        : {}),
      ...(event.frequencyHz !== undefined
        ? { frequency: event.frequencyHz ?? 0 }
        : {}),
      ...(event.temperatureC !== undefined
        ? { temperature: event.temperatureC ?? undefined }
        : {}),
      ...(event.connectivityStatus !== undefined
        ? {
            connectivityStatus: event.connectivityStatus,
            online: event.connectivityStatus === "ONLINE",
          }
        : {}),
      ...(event.isOn !== undefined
        ? { state: event.isOn ? "on" : "off" }
        : {}),
      ...(event.updatedAt || event.readAt
        ? { lastStateChange: event.updatedAt ?? event.readAt }
        : {}),
    };
  });
}
