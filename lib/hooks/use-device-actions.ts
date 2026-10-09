import { useCallback, useMemo, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";

import type { SmartDevice } from "@/lib/domain/device";
import { canControlHome } from "@/lib/domain/home";
import type { SmartHomePlace } from "@/lib/domain/home";
import { smartHomeService } from "@/lib/services/smart-home-service";

const DEVICE_STATUS_CONFIRMATION_TIMEOUT_MS = 2000;

type DeviceState = SmartDevice["state"];

type DeviceUpdates = {
  name?: string;
};

type UseDeviceActionsOptions = {
  devices: SmartDevice[];
  homes: SmartHomePlace[];
  setDevices: Dispatch<SetStateAction<SmartDevice[]>>;
  getTimeStamp: () => string;
};

export function useDeviceActions({
  devices,
  homes,
  setDevices,
  getTimeStamp,
}: UseDeviceActionsOptions) {
  const devicesRef = useRef(devices);
  devicesRef.current = devices;

  const setHomeDeviceState = useCallback(
    async (id: string, state: DeviceState) => {
      const device = devicesRef.current.find((item) => item.id === id);

      if (!device || !device.online) return;

      const home = homes.find((item) => item.id === device.homeId);

      if (!canControlHome(home?.homeRole)) {
        throw new Error(
          home?.homeRole === "GUEST"
            ? "Tu rol de invitado permite consultar, pero no controlar dispositivos."
            : "No se pudo verificar tu rol en este hogar. Actualiza los hogares e inténtalo de nuevo.",
        );
      }

      await smartHomeService.updateDeviceState(device.homeId, id, state);

      await new Promise<void>((resolve) => {
        setTimeout(resolve, DEVICE_STATUS_CONFIRMATION_TIMEOUT_MS);
      });

      const latestDevice = devicesRef.current.find((item) => item.id === id);

      // El listener realtime ya confirmó el estado solicitado.
      if (latestDevice?.state === state) return;

      try {
        const refreshedDevices = await smartHomeService.listDevices(
          device.homeId,
        );
        const refreshedDevice = refreshedDevices.find((item) => item.id === id);

        if (!refreshedDevice) return;

        setDevices((items) =>
          items.map((item) => {
            if (item.id !== id || item.state === state) return item;

            return {
              ...item,
              state: refreshedDevice.state,
              online: refreshedDevice.online,
              lastStateChange:
                refreshedDevice.lastStateChange ?? item.lastStateChange,
            };
          }),
        );
      } catch {
        // Conserva el último estado conocido si falla la lectura de respaldo.
      }
    },
    [homes, setDevices],
  );

  const toggleDevice = useCallback(
    async (id: string) => {
      const device = devices.find((item) => item.id === id);

      if (!device || !device.online) return;

      await setHomeDeviceState(
        id,
        device.state === "on" ? "off" : "on",
      );
    },
    [devices, setHomeDeviceState],
  );

  const removeDevice = useCallback(
    async (deviceId: string) => {
      const device = devices.find((item) => item.id === deviceId);

      if (!device) return;

      await smartHomeService.deleteDevice(device.homeId, deviceId);

      setDevices((items) =>
        items.filter((item) => item.id !== deviceId),
      );
    },
    [devices, setDevices],
  );

  const updateDevice = useCallback(
    async (deviceId: string, updates: DeviceUpdates) => {
      const device = devices.find((item) => item.id === deviceId);

      if (!device) return;

      const updated = await smartHomeService.updateDevice(
        device.homeId,
        deviceId,
        updates,
      );

      setDevices((items) =>
        items.map((item) =>
          item.id === deviceId ? updated : item,
        ),
      );
    },
    [devices, setDevices],
  );

  return useMemo(
    () => ({
      removeDevice,
      updateDevice,
      setHomeDeviceState,
      toggleDevice,
    }),
    [
      removeDevice,
      updateDevice,
      setHomeDeviceState,
      toggleDevice,
    ],
  );
}
