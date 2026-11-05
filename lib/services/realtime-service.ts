import { io, type Socket } from "socket.io-client";

import { apiConfig } from "@/lib/config/api-config";
import type { DeviceConnectivityStatus } from "@/lib/domain/device";
import { getAccessToken } from "@/lib/session/session-store";

export type DeviceStatusUpdatedEvent = {
  deviceId?: string;
  id?: string;
  homeId?: string;
  connectivityStatus?: DeviceConnectivityStatus;
  isOn?: boolean;
  currentPowerW?: number | null;
  energyTotalKwh?: number | null;
  voltageV?: number | null;
  currentA?: number | null;
  frequencyHz?: number | null;
  temperatureC?: number | null;
  readAt?: string;
  updatedAt?: string;
};

export type RealtimeEventMap = {
  "device.status.updated": DeviceStatusUpdatedEvent;
  "consumption.created": Record<string, unknown>;
  "notification.created": Record<string, unknown>;
  "notification.unread_count.updated": { unreadCount?: number };
  "realtime.connected": { userId?: string };
  "realtime.error": { message?: string };
};

type EventHandler<EventName extends keyof RealtimeEventMap> = (
  payload: RealtimeEventMap[EventName],
) => void;

class RealtimeService {
  private socket: Socket | null = null;

  connect(): void {
    // Cerrar cualquier conexión anterior antes de evaluar la nueva sesión.
    this.disconnect();

    const token = getAccessToken();
    if (!apiConfig.baseUrl || !token) return;

    const socketOrigin = apiConfig.baseUrl.replace(/\/api\/v1\/?$/, "");
    this.socket = io(`${socketOrigin}/realtime`, {
      auth: { token },
      transports: ["websocket"],
      withCredentials: true,
      autoConnect: true,
    });
  }

  disconnect(): void {
    this.socket?.removeAllListeners();
    this.socket?.disconnect();
    this.socket = null;
  }

  on<EventName extends keyof RealtimeEventMap>(
    eventName: EventName,
    handler: EventHandler<EventName>,
  ): () => void {
    const socket = this.socket;
    const socketHandler = handler as (...args: any[]) => void;

    socket?.on(eventName as string, socketHandler);

    return () => {
      socket?.off(eventName as string, socketHandler);
    };
  }
}

export const realtimeService = new RealtimeService();
