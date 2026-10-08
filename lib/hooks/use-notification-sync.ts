import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";

import { useMockApi } from "@/lib/config/api-config";
import type { SmartNotification } from "@/lib/services/notifications-service";
import { notificationsService } from "@/lib/services/notifications-service";
import { loadSession } from "@/lib/session/session-store";

type UseNotificationSyncOptions = {
  sessionRevision: number;
  setNotifications: Dispatch<SetStateAction<SmartNotification[]>>;
  setUnreadNotificationCount: Dispatch<SetStateAction<number>>;
  setOfflineMode: Dispatch<SetStateAction<boolean>>;
};

export function useNotificationSync({
  sessionRevision,
  setNotifications,
  setUnreadNotificationCount,
  setOfflineMode,
}: UseNotificationSyncOptions) {
  useEffect(() => {
    if (useMockApi) return;

    let active = true;

    loadSession()
      .then((session) => {
        if (!active || !session) {
          setNotifications([]);
          setUnreadNotificationCount(0);
          return;
        }

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
          setOfflineMode(true);
        }
      });

    return () => {
      active = false;
    };
  }, [
    sessionRevision,
    setNotifications,
    setOfflineMode,
    setUnreadNotificationCount,
  ]);
}