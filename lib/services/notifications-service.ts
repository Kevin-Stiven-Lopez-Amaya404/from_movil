import { apiClient } from "@/lib/api/api-client";
import { useMockApi } from "@/lib/config/api-config";

export type NotificationStatus = "UNREAD" | "READ" | "DISMISSED";

export type SmartNotification = {
  id: string;
  title?: string;
  message?: string;
  description?: string;
  type?: "ALERT" | string;
  status: NotificationStatus;
  priority?: "baja" | "media" | "alta" | string;
  createdAt?: string;
  readAt?: string | null;
  dismissedAt?: string | null;
};

export interface NotificationsService {
  list(options?: {
    status?: NotificationStatus;
    limit?: number;
    token?: string;
  }): Promise<SmartNotification[]>;
  unreadCount(token?: string): Promise<number>;
  markAsRead(
    notificationId: string,
    token?: string,
  ): Promise<SmartNotification>;
  dismiss(
    notificationId: string,
    token?: string,
  ): Promise<SmartNotification>;
  markAllAsRead(token?: string): Promise<void>;
}

const mockNotifications: SmartNotification[] = [];

const mockNotificationsService: NotificationsService = {
  async list() {
    return [...mockNotifications];
  },
  async unreadCount() {
    return mockNotifications.filter((item) => item.status === "UNREAD").length;
  },
  async markAsRead(notificationId) {
    const notification = mockNotifications.find(
      (item) => item.id === notificationId,
    );
    if (!notification) throw new Error("Notificación no encontrada.");
    notification.status = "READ";
    return notification;
  },
  async dismiss(notificationId) {
    const notification = mockNotifications.find(
      (item) => item.id === notificationId,
    );
    if (!notification) throw new Error("Notificación no encontrada.");
    notification.status = "DISMISSED";
    return notification;
  },
  async markAllAsRead() {
    mockNotifications.forEach((item) => {
      item.status = "READ";
    });
  },
};

const backendNotificationsService: NotificationsService = {
  list({ status, limit, token } = {}) {
    const query = new URLSearchParams();
    if (status) query.set("status", status);
    if (limit) query.set("limit", String(limit));
    const suffix = query.toString() ? `?${query.toString()}` : "";

    return apiClient.get<SmartNotification[]>(
      `/api/v1/notifications${suffix}`,
      { token },
    );
  },
  unreadCount(token) {
    return apiClient
      .get<{
        unreadCount?: number;
        count?: number;
      }>("/api/v1/notifications/unread-count", { token })
      .then((response) => response.unreadCount ?? response.count ?? 0);
  },
  markAsRead(notificationId, token) {
    return apiClient.patch<SmartNotification>(
      `/api/v1/notifications/${notificationId}/read`,
      undefined,
      { token },
    );
  },
  dismiss(notificationId, token) {
    return apiClient.patch<SmartNotification>(
      `/api/v1/notifications/${notificationId}/dismiss`,
      undefined,
      { token },
    );
  },
  markAllAsRead(token) {
    return apiClient
      .patch<{
        updated?: number;
      }>("/api/v1/notifications/read-all", undefined, { token })
      .then(() => undefined);
  },
};

export const notificationsService: NotificationsService = new Proxy(
  mockNotificationsService,
  {
    get(_target, property) {
      const service = useMockApi
        ? mockNotificationsService
        : backendNotificationsService;
      const value: unknown = Reflect.get(service, property, service);
      return typeof value === "function" ? value.bind(service) : value;
    },
  },
);
