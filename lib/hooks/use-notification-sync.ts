import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";

import type { SmartNotification } from "@/lib/services/notifications-service";
import { notificationsService } from "@/lib/services/notifications-service";
import { loadSession } from "@/lib/session/session-store";

type UseNotificationSyncOptions = {
  sessionRevision: number;
  setNotifications: Dispatch<SetStateAction<SmartNotification[]>>;
  setUnreadNotificationCount: Dispatch<SetStateAction<number>>;
};

export function useNotificationSync({
  sessionRevision,
  setNotifications,
  setUnreadNotificationCount,
}: UseNotificationSyncOptions) {
  useEffect(() => {
    let active = true;

    // Evitar mostrar notificaciones de la sesión anterior.
    setNotifications([]);
    setUnreadNotificationCount(0);

    loadSession()
      .then((session) => {
        if (!active) return;

        if (!session) return;

        return Promise.all([
          notificationsService.list({ limit: 50 }),
          notificationsService.unreadCount(),
        ]).then(([items, count]) => {
          if (!active) return;

          setNotifications(items);
          setUnreadNotificationCount(count);
        });
      })
      .catch(() => {
        if (active) {
          console.warn(
            "[NotificationSync] No se pudieron sincronizar las notificaciones.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, [
    sessionRevision,
    setNotifications,
    setUnreadNotificationCount,
  ]);
}
