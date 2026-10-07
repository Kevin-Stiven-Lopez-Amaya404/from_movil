import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";

import { useMockApi } from "@/lib/config/api-config";
import type { SmartDevice } from "@/lib/domain/device";
import type { SmartNotification } from "@/lib/services/notifications-service";
import {
  realtimeService,
  type DeviceStatusUpdatedEvent,
} from "@/lib/services/realtime-service";
import { loadSession } from "@/lib/session/session-store";

type UseRealtimeSyncOptions = {
  sessionRevision: number;
  setDevices: Dispatch<SetStateAction<SmartDevice[]>>;
  setNotifications: Dispatch<SetStateAction<SmartNotification[]>>;
  setUnreadNotificationCount: Dispatch<SetStateAction<number>>;
  setOfflineMode: Dispatch<SetStateAction<boolean>>;
  setLastSync: Dispatch<SetStateAction<string>>;
  getTimeStamp: () => string;
};

export function useRealtimeSync({
  sessionRevision,
  setDevices,
  setNotifications,
  setUnreadNotificationCount,
  setOfflineMode,
  setLastSync,
  getTimeStamp,
}: UseRealtimeSyncOptions) {
  useEffect(() => {
    if (useMockApi) return;

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
              const deviceId = event.deviceId ?? event.id;

              if (!deviceId) return;

              setDevices((items) =>
                items.map((device) =>
                  device.id === deviceId
                    ? {
                        ...device,
                        ...(event.homeId
                          ? { homeId: event.homeId }
                          : {}),
                        ...(event.currentPowerW !== undefined
                          ? { power: event.currentPowerW ?? 0 }
                          : {}),
                        ...(event.energyTotalKwh !== undefined
                          ? {
                              energy:
                                (event.energyTotalKwh ?? 0) * 1000,
                            }
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
                          ? {
                              temperature:
                                event.temperatureC ?? undefined,
                            }
                          : {}),
                        ...(event.connectivityStatus !== undefined
                          ? {
                              online:
                                event.connectivityStatus === "ONLINE",
                            }
                          : {}),
                        ...(event.isOn !== undefined
                          ? { state: event.isOn ? "on" : "off" }
                          : {}),
                        ...(event.updatedAt || event.readAt
                          ? {
                              lastStateChange:
                                event.updatedAt ?? event.readAt,
                            }
                          : {}),
                      }
                    : device,
                ),
              );
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
          realtimeService.on("consumption.created", () => {
            setLastSync(getTimeStamp());
          }),
          realtimeService.on("realtime.connected", () => {
            setOfflineMode(false);
            setLastSync(getTimeStamp());
          }),
          realtimeService.on("realtime.error", () => {
            setOfflineMode(true);
          }),
        );
      })
      .catch(() => {
        if (active) {
          setOfflineMode(true);
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
    setOfflineMode,
    setUnreadNotificationCount,
  ]);
}