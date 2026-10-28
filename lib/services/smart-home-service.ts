
import { apiClient } from "@/lib/api/api-client";
import { ApiError } from "@/lib/api/api-error";

import type {
  DeviceConnectivityStatus,
  SmartDevice,
} from "@/lib/domain/device";
import type {
  HomeInvitation,
  HomeMember,
  HomeRole,
  SmartHomePlace,
} from "@/lib/domain/home";

export type CreateHomeRequest = {
  name: string;
  location?: string;
};

export type CreateDeviceRequest = {
  homeId: string;
  name: string;
  manufacturerDeviceId?: string;
  transportType?: "WIFI" | "BLUETOOTH";
  messagingProtocol?: "MQTT";
};

export type UpdateDeviceRequest = {
  name?: string;
  transportType?: "WIFI" | "BLUETOOTH";
  messagingProtocol?: "MQTT";
};

type BackendDevice = {
  id: string;
  homeId: string;
  name: string;
  status?: string;
  connectivityStatus?: DeviceConnectivityStatus;
  isOn?: boolean;
  currentPowerW?: number | null;
  energyTotalKwh?: number | null;
  voltageV?: number | null;
  currentA?: number | null;
  frequencyHz?: number | null;
  temperatureC?: number | null;
  manufacturerDeviceId?: string | null;
  transportType?: "WIFI" | "BLUETOOTH" | null;
  messagingProtocol?: "MQTT" | null;
  lastSeenAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
};

export type ControlDeviceResponse = {
  id: string;
  homeId: string;
  command: "TURN_ON" | "TURN_OFF";
  status: "COMMAND_PUBLISHED";
  previousIsOn: boolean;
  connectivityStatus: "ONLINE" | "OFFLINE";
};

function mapBackendDevice(device: BackendDevice): SmartDevice {
  const manufacturerId = device.manufacturerDeviceId?.toLowerCase() ?? "";
  const modelName = manufacturerId.startsWith("shelly1pmg4-")
    ? "Shelly 1PM Gen4"
    : manufacturerId.startsWith("shellyplus1pm-")
      ? "Shelly Plus 1PM"
      : manufacturerId.startsWith("shelly")
        ? "Shelly (modelo no identificado)"
        : "Dispositivo inteligente";
  return {
    id: device.id,
    homeId: device.homeId,
    name: device.name,
    modelName,
    category: "Electrodomesticos",
    icon: "power-plug-outline",
    power: device.currentPowerW ?? 0,
    energy: (device.energyTotalKwh ?? 0) * 1000,
    voltage: device.voltageV ?? 0,
    current: device.currentA ?? 0,
    frequency: device.frequencyHz ?? 0,
    connectivityStatus: device.connectivityStatus ?? "UNKNOWN",
    online: device.connectivityStatus === "ONLINE",
    temperature: device.temperatureC ?? undefined,
    state: device.isOn ? "on" : "off",
    yesterday: 0,
  lastSeenAt: device.lastSeenAt ?? null,
  lastStateChange: device.updatedAt ?? device.lastSeenAt ?? undefined,
  };
}

export interface SmartHomeService {
  listHomes(token?: string): Promise<SmartHomePlace[]>;
  listHomeMembers(homeId: string, token?: string): Promise<HomeMember[]>;
  listIncomingInvitations(token?: string): Promise<HomeInvitation[]>;
  acceptInvitation(invitationId: string, token?: string): Promise<HomeInvitation>;
  rejectInvitation(invitationId: string, token?: string): Promise<HomeInvitation>;
  updateMemberRole(
    homeId: string,
    memberId: string,
    role: HomeRole,
    token?: string,
  ): Promise<HomeMember>;
  revokeMember(homeId: string, memberId: string, token?: string): Promise<HomeMember>;
  leaveHome(homeId: string, token?: string): Promise<void>;
  inviteHomeMember(
    homeId: string,
    email: string,
    role: Exclude<HomeRole, "OWNER">,
    token?: string,
  ): Promise<HomeMember>;
  createHome(
    request: CreateHomeRequest,
    token?: string,
  ): Promise<SmartHomePlace>;
  updateHome(
    homeId: string,
    name: string,
    token?: string,
  ): Promise<SmartHomePlace>;
  deleteHome(
    homeId: string,
    token?: string,
  ): Promise<{ deleted: boolean }>;
  toggleHomeFavorite(
    homeId: string,
    favorite: boolean,
    token?: string,
  ): Promise<SmartHomePlace>;
  listDevices(homeId?: string, token?: string): Promise<SmartDevice[]>;
  createDevice(
    request: CreateDeviceRequest,
    token?: string,
  ): Promise<SmartDevice>;
  updateDeviceState(
    homeId: string,
    deviceId: string,
    state: "on" | "off",
    token?: string,
  ): Promise<ControlDeviceResponse>;
  updateDevice(
    homeId: string,
    deviceId: string,
    request: UpdateDeviceRequest,
    token?: string,
  ): Promise<SmartDevice>;
  deleteDevice(homeId: string, deviceId: string, token?: string): Promise<void>;
  activateDevice(
    homeId: string,
    deviceId: string,
    token?: string,
  ): Promise<SmartDevice>;
  deactivateDevice(
    homeId: string,
    deviceId: string,
    token?: string,
  ): Promise<SmartDevice>;
}

const backendSmartHomeService: SmartHomeService = {
  listHomes(token) {
    return apiClient
      .get<(SmartHomePlace & { favorite?: boolean })[]>("/api/v1/homes", {
        token,
      })
      .then((homes) =>
        homes.map((home) => ({
          id: home.id,
          name: home.name,
          location: home.location ?? "Hogar",
          favorite: home.favorite ?? false,
        })),
      );
  },

  listHomeMembers(homeId, token) {
    return apiClient.get<HomeMember[]>(
      `/api/v1/homes/${encodeURIComponent(homeId)}/members`,
      { token },
    );
  },

  listIncomingInvitations(token) {
    return apiClient.get<HomeInvitation[]>("/api/v1/invitations", { token });
  },

  acceptInvitation(invitationId, token) {
    return apiClient.patch<HomeInvitation>(
      `/api/v1/invitations/${encodeURIComponent(invitationId)}/accept`,
      undefined,
      { token },
    );
  },

  rejectInvitation(invitationId, token) {
    return apiClient.patch<HomeInvitation>(
      `/api/v1/invitations/${encodeURIComponent(invitationId)}/reject`,
      undefined,
      { token },
    );
  },

  updateMemberRole(homeId, memberId, role, token) {
    return apiClient.patch<HomeMember, { role: HomeRole }>(
      `/api/v1/homes/${encodeURIComponent(homeId)}/members/${encodeURIComponent(memberId)}/role`,
      { role },
      { token },
    );
  },

  revokeMember(homeId, memberId, token) {
    return apiClient.patch<HomeMember>(
      `/api/v1/homes/${encodeURIComponent(homeId)}/members/${encodeURIComponent(memberId)}/revoke`,
      undefined,
      { token },
    );
  },

  leaveHome(homeId, token) {
    return apiClient.post<void>(
      `/api/v1/homes/${encodeURIComponent(homeId)}/leave`,
      undefined,
      { token },
    );
  },

  inviteHomeMember(homeId, email, role, token) {
    return apiClient.post<
      HomeMember,
      { email: string; role: Exclude<HomeRole, "OWNER"> }
    >(
      `/api/v1/homes/${encodeURIComponent(homeId)}/invitations`,
      { email: email.trim().toLowerCase(), role },
      { token },
    );
  },

  createHome(request, token) {
    return apiClient
      .post<SmartHomePlace, { name: string }>(
        "/api/v1/homes",
        {
          name: request.name,
        },
        { token },
      )
      .then((home) => ({
        ...home,
        location: home.location ?? request.location ?? "Hogar",
        favorite: home.favorite ?? false,
      }));
  },

  updateHome(homeId, name, token) {
    return apiClient.patch<
      {
        id: string;
        name: string;
        createdBy: string;
        status: string;
        createdAt: string;
        updatedAt: string;
      },
      { name: string }
    >(
      `/api/v1/homes/${encodeURIComponent(homeId)}`,
      { name: name.trim() },
      { token },
    ).then((home) => ({
      id: home.id,
      name: home.name,
      location: "Hogar",
      favorite: false,
    }));
  },

  deleteHome(homeId, token) {
    return apiClient.delete<{ deleted: boolean }>(
      `/api/v1/homes/${encodeURIComponent(homeId)}`,
      { token },
    );
  },

  toggleHomeFavorite() {
    throw new ApiError(
      "El backend todavía no expone favoritos de hogares.",
      "UNKNOWN_ERROR",
    );
  },

  listDevices(homeId, token) {
    if (!homeId) return Promise.resolve([]);

    return apiClient
      .get<BackendDevice[]>(`/api/v1/homes/${homeId}/devices`, { token })
      .then((devices) => devices.map((device) => mapBackendDevice(device)));
  },

  createDevice(request, token) {
    return apiClient
      .post<BackendDevice, Record<string, unknown>>(
        `/api/v1/homes/${encodeURIComponent(request.homeId)}/devices`,
        {
          name: request.name,
          ...(request.manufacturerDeviceId
            ? { manufacturerDeviceId: request.manufacturerDeviceId }
            : {}),
          ...(request.transportType
            ? { transportType: request.transportType }
            : {}),
          ...(request.messagingProtocol
            ? { messagingProtocol: request.messagingProtocol }
            : {}),
        },
        { token },
      )
      .then(mapBackendDevice);
  },

  updateDeviceState(homeId, deviceId, state, token) {
    return apiClient
      .patch<
        ControlDeviceResponse,
        { command: "TURN_ON" | "TURN_OFF" }
      >(`/api/v1/homes/${homeId}/devices/${deviceId}/control`, { command: state === "on" ? "TURN_ON" : "TURN_OFF" }, { token })
  },

  updateDevice(homeId, deviceId, request, token) {
    return apiClient
      .patch<
        BackendDevice,
        UpdateDeviceRequest
      >(`/api/v1/homes/${homeId}/devices/${deviceId}`, request, { token })
      .then(mapBackendDevice);
  },

  deleteDevice(homeId, deviceId, token) {
    return apiClient.delete<void>(
      `/api/v1/homes/${homeId}/devices/${deviceId}`,
      { token },
    );
  },

  activateDevice(homeId, deviceId, token) {
    return apiClient
      .patch<BackendDevice>(
        `/api/v1/homes/${homeId}/devices/${deviceId}/activate`,
        undefined,
        { token },
      )
      .then(mapBackendDevice);
  },

  deactivateDevice(homeId, deviceId, token) {
    return apiClient
      .patch<BackendDevice>(
        `/api/v1/homes/${homeId}/devices/${deviceId}/deactivate`,
        undefined,
        { token },
      )
      .then(mapBackendDevice);
  },
};

export const smartHomeService: SmartHomeService = backendSmartHomeService;
