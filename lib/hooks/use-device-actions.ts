import { useCallback, useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";

import type { SmartDevice } from "@/lib/domain/device";
import { smartHomeService } from "@/lib/services/smart-home-service";

type DeviceState = SmartDevice["state"];

type DeviceUpdates = {
  name?: string;
};

type UseDeviceActionsOptions = {
  devices: SmartDevice[];
  setDevices: Dispatch<SetStateAction<SmartDevice[]>>;
  getTimeStamp: () => string;
};

export function useDeviceActions({
  devices,
  setDevices,
  getTimeStamp,
}: UseDeviceActionsOptions) {
  const setHomeDeviceState = useCallback(
    async (id: string, state: DeviceState) => {
      const device = devices.find((item) => item.id === id);

      if (!device || !device.online) return;

      const previousDevice = device;

      setDevices((items) =>
        items.map((item) =>
          item.id === id
            ? { ...item, state, lastStateChange: getTimeStamp() }
            : item,
        ),
      );

      try {
        const updated = await smartHomeService.updateDeviceState(
          device.homeId,
          id,
          state,
        );

        setDevices((items) =>
          items.map((item) => (item.id === id ? updated : item)),
        );
      } catch (error) {
        setDevices((items) =>
          items.map((item) => (item.id === id ? previousDevice : item)),
        );

        throw error;
      }
    },
    [devices, getTimeStamp, setDevices],
  );

  const toggleDevice = useCallback(
    (id: string) => {
      const device = devices.find((item) => item.id === id);

      if (!device || !device.online) return;

      void setHomeDeviceState(
        id,
        device.state === "on" ? "off" : "on",
      );
    },
    [devices, setHomeDeviceState],
  );

  const setAllHomeDevicesState = useCallback(
    (homeId: string, state: DeviceState) => {
      setDevices((items) =>
        items.map((item) =>
          item.homeId === homeId
            ? { ...item, state, lastStateChange: getTimeStamp() }
            : item,
        ),
      );

      smartHomeService
        .setAllHomeDevicesState(homeId, state)
        .catch(() => null);
    },
    [getTimeStamp, setDevices],
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
      setAllHomeDevicesState,
      toggleDevice,
    }),
    [
      removeDevice,
      updateDevice,
      setHomeDeviceState,
      setAllHomeDevicesState,
      toggleDevice,
    ],
  );
}