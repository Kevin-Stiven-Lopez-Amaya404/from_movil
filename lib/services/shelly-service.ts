
import { apiClient } from "@/lib/api/api-client";

export type DiscoveredShellyDevice = {
  ip: string;
  hostname: string;
  port: number;
  manufacturerDeviceId: string;
  mac: string;
  model: string;
  modelCode: string;
  generation: number;
  firmwareVersion: string | null;
};

export type IdentifiedShellyDevice = {
  manufacturerDeviceId: string;
  model: string;
  modelCode: string;
  mac: string;
  wifiIp: string;
  firmwareVersion: string | null;
  mqttConnected: boolean | null;
  authenticationRequired: boolean;
  message: string;
};

export const shellyService = {
  discover(homeId: string) {
    return apiClient.get<DiscoveredShellyDevice[]>(
      `/api/v1/homes/${encodeURIComponent(homeId)}/shelly/discover`,
      { timeoutMs: 20000 },
    );
  },

  identify(homeId: string, shellyIp: string) {
    return apiClient.post<
      IdentifiedShellyDevice,
      { shellyIp: string }
    >(
      `/api/v1/homes/${encodeURIComponent(homeId)}/shelly/identify`,
      { shellyIp },
    );
  },
};
