import { useCallback, useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";

import type { SmartNotification } from "@/lib/services/notifications-service";
import { notificationsService } from "@/lib/services/notifications-service";

type UseNotificationActionsOptions = {
  notifications: SmartNotification[];
  setNotifications: Dispatch<SetStateAction<SmartNotification[]>>;
  setUnreadNotificationCount: Dispatch<SetStateAction<number>>;
};

export function useNotificationActions({
  notifications,
  setNotifications,
  setUnreadNotificationCount,
}: UseNotificationActionsOptions) {
  const markNotificationAsRead = useCallback(
    async (notificationId: string) => {
      const target = notifications.find(
        (item) => item.id === notificationId,
      );

      if (!target || target.status !== "UNREAD") {
        return;
      }

      await notificationsService.markAsRead(notificationId);

      setNotifications((items) =>
        items.map((item) =>
          item.id === notificationId
            ? { ...item, status: "READ" }
            : item,
        ),
      );

      try {
        const count = await notificationsService.unreadCount();
        setUnreadNotificationCount(count);
      } catch {
        console.warn(
          "[Notifications] No se pudo actualizar el contador.",
        );
      }
    },
    [notifications, setNotifications, setUnreadNotificationCount],
  );

  const dismissNotification = useCallback(
    async (notificationId: string) => {
      const target = notifications.find(
        (item) => item.id === notificationId,
      );

      const next = await notificationsService.dismiss(notificationId);

      setNotifications((items) =>
        items.map((item) =>
          item.id === notificationId
            ? {
                ...item,
                status: next.status ?? "DISMISSED",
              }
            : item,
        ),
      );

      if (target?.status === "UNREAD") {
        setUnreadNotificationCount((count) =>
          Math.max(0, count - 1),
        );
      }
    },
    [
      notifications,
      setNotifications,
      setUnreadNotificationCount,
    ],
  );

  const markAllNotificationsAsRead = useCallback(async () => {
    await notificationsService.markAllAsRead();

    setNotifications((items) =>
      items.map((item) =>
        item.status === "UNREAD"
          ? { ...item, status: "READ" }
          : item,
      ),
    );

    setUnreadNotificationCount(0);
  }, [setNotifications, setUnreadNotificationCount]);

  return useMemo(
    () => ({
      markNotificationAsRead,
      dismissNotification,
      markAllNotificationsAsRead,
    }),
    [
      markNotificationAsRead,
      dismissNotification,
      markAllNotificationsAsRead,
    ],
  );
}
