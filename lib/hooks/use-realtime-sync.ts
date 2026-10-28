import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";

import type { SmartDevice } from "@/lib/domain/device";
import type { SmartNotification } from "@/lib/services/notifications-service";
import {
  realtimeService,
  type DeviceStatusUpdatedEvent,
} from "@/lib/services/realtime-service";
import { loadSession } from "@/lib/session/session-store";
import { applyDeviceStatusEvent } from "@/lib/realtime/apply-device-status-event";

type UseRealtimeSyncOptions = {
  sessionRevision: number;
  setDevices: Dispatch<SetStateAction<SmartDevice[]>>;
  setNotifications: Dispatch<SetStateAction<SmartNotification[]>>;
  setUnreadNotificationCount: Dispatch<SetStateAction<number>>;
  setLastSync: Dispatch<SetStateAction<string>>;
  getTimeStamp: () => string;
};

export function useRealtimeSync({
  sessionRevision,
  setDevices,
  setNotifications,
  setUnreadNotificationCount,
  setLastSync,
  getTimeStamp,
}: UseRealtimeSyncOptions) {
  useEffect(() => {
    let active = true;
    const unsubscribers: (() => void)[] = [];

    loadSession()
      .then((session) => {
        if (!active || !session) return;

        realtimeService.connect();

        unsubscribers.push(
          realtimeService.on(
            "device.status.updated",
            (event: DeviceStatusUpdatedEvent) => {
              setDevices((items) => applyDeviceStatusEvent(items, event));
            },
          ),
          realtimeService.on("notification.created", (event) => {
            const notification = event as SmartNotification;

            if (!notification.id) return;

            setNotifications((items) => [
              notification,
              ...items.filter(
                (item) => item.id !== notification.id,
              ),
            ]);

            if (notification.status === "UNREAD") {
              setUnreadNotificationCount((count) => count + 1);
            }
          }),
          realtimeService.on(
            "notification.unread_count.updated",
            (event) => {
              if (event.unreadCount !== undefined) {
                setUnreadNotificationCount(event.unreadCount);
              }
            },
          ),
          realtimeService.on("consumption.created", (event) => {
            // Las lecturas confirmadas por el backend alimentan las tarjetas
            // sin inferir conectividad ni estado del relé.
            if (typeof event.deviceId === "string") {
              const deviceId = event.deviceId;
              const power = event.powerW;
              const energy = event.energyTotalKwh;
              setDevices((items) => items.map((device) =>
                device.id !== deviceId
                  ? device
                  : {
                      ...device,
                      ...(typeof power === "number" && Number.isFinite(power)
                        ? { power } : {}),
                      ...(typeof energy === "number" && Number.isFinite(energy)
                        ? { energy: energy * 1000 } : {}),
                    },
              ));
            }
            setLastSync(getTimeStamp());
          }),
          realtimeService.on("realtime.connected", () => {
            setLastSync(getTimeStamp());
          }),
          realtimeService.on("realtime.error", () => {
            console.warn(
              "[RealtimeSync] Error en la conexión en tiempo real.",
            );
          }),
        );
      })
      .catch(() => {
        if (active) {
          console.warn(
            "[RealtimeSync] No se pudo iniciar la sincronización en tiempo real.",
          );
        }
      });

    return () => {
      active = false;
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      realtimeService.disconnect();
    };
  }, [
    sessionRevision,
    getTimeStamp,
    setDevices,
    setLastSync,
    setNotifications,
    setUnreadNotificationCount,
  ]);
}
