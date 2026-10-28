import { useCallback, useEffect, useMemo, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";

import type { SmartDevice } from "@/lib/domain/device";
import { canControlHome } from "@/lib/domain/home";
import type { SmartHomePlace } from "@/lib/domain/home";
import { smartHomeService } from "@/lib/services/smart-home-service";

const DEVICE_STATUS_CONFIRMATION_TIMEOUT_MS = 2000;
const DEVICE_STATUS_RECHECK_COUNT = 3;

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
  const pendingControlsRef = useRef(new Set<string>());

  useEffect(() => {
    devicesRef.current = devices;
  }, [devices]);

  const setHomeDeviceState = useCallback(
    async (id: string, state: DeviceState) => {
      // Evita publicar comandos contradictorios durante una confirmación pendiente.
      if (pendingControlsRef.current.has(id)) return;

      const device = devicesRef.current.find((item) => item.id === id);
      if (!device || !device.online) {
        throw new Error("El dispositivo está desconectado. No se envió el comando.");
      }

      const home = homes.find((item) => item.id === device.homeId);
      if (!canControlHome(home?.homeRole)) {
        throw new Error(
          home?.homeRole === "GUEST"
            ? "Tu rol de invitado permite consultar, pero no controlar dispositivos."
            : "No se pudo verificar tu rol en este hogar. Actualiza los hogares e inténtalo de nuevo.",
        );
      }

      if (device.state === state) return;
      pendingControlsRef.current.add(id);
      try {
        const result = await smartHomeService.updateDeviceState(device.homeId, id, state);
        if (result.status !== "COMMAND_PUBLISHED") {
          throw new Error("El backend no confirmó la publicación del comando.");
        }

        // El ACK de publicación no es una respuesta del relé. Esperar
        // telemetría o lectura de respaldo, sin actualizar el switch optimistamente.
        for (let attempt = 0; attempt < DEVICE_STATUS_RECHECK_COUNT; attempt += 1) {
          await new Promise<void>((resolve) =>
            setTimeout(resolve, DEVICE_STATUS_CONFIRMATION_TIMEOUT_MS),
          );

          const live = devicesRef.current.find((item) => item.id === id);
          if (live?.online && live.state === state) return;

          try {
            const refreshed = (await smartHomeService.listDevices(device.homeId))
              .find((item) => item.id === id);
            if (refreshed) {
              setDevices((items) =>
                items.map((item) => item.id === id
                  ? { ...item, ...refreshed }
                  : item),
              );
              if (refreshed.online && refreshed.state === state) return;
              if (!refreshed.online) {
                throw new Error("El dispositivo perdió la conexión.");
              }
            }
          } catch (error) {
            if (error instanceof Error &&
                error.message === "El dispositivo perdió la conexión.") {
              throw error;
            }
            // Fallo transitorio de consulta; el siguiente ciclo puede recuperarse.
          }
        }
        throw new Error(
          "El comando se publicó, pero el Shelly no confirmó el cambio de estado. " +
          "El interruptor conserva el último estado conocido.",
        );
      } finally {
        pendingControlsRef.current.delete(id);
      }
    },
    [homes, setDevices],
  );

  const toggleDevice = useCallback(
    async (id: string) => {
      if (pendingControlsRef.current.has(id)) return;
      const device = devicesRef.current.find((item) => item.id === id);
      if (!device) return;
      await setHomeDeviceState(id, device.state === "on" ? "off" : "on");
    },
    [setHomeDeviceState],
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
