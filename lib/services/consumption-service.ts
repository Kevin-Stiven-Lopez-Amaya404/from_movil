import { apiClient } from "@/lib/api/api-client";

export type ConsumptionQuery = {
  from?: string;
  to?: string;
  limit?: number;
};

export type ConsumptionRecord = Record<string, unknown> & {
  energyDeltaKwh?: number | null;
  energyTotalKwh?: number | null;
  recordedAt?: string;
  timestamp?: string;
};

function queryString(query?: ConsumptionQuery): string {
  if (!query) return "";
  const params = new URLSearchParams();
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  if (query.limit) params.set("limit", String(query.limit));
  const value = params.toString();
  return value ? `?${value}` : "";
}

export const consumptionService = {
  listHome(homeId: string, query?: ConsumptionQuery, token?: string) {
    return apiClient.get<ConsumptionRecord[]>(
      `/api/v1/homes/${homeId}/consumption${queryString(query)}`,
      { token },
    );
  },
  getHomeSummary(homeId: string, query?: ConsumptionQuery, token?: string) {
    return apiClient.get<ConsumptionRecord>(
      `/api/v1/homes/${homeId}/consumption/summary${queryString(query)}`,
      { token },
    );
  },
  getHomeDaily(homeId: string, query?: ConsumptionQuery, token?: string) {
    return apiClient.get<ConsumptionRecord[]>(
      `/api/v1/homes/${homeId}/consumption/daily${queryString(query)}`,
      { token },
    );
  },
  listDevice(
    homeId: string,
    deviceId: string,
    query?: ConsumptionQuery,
    token?: string,
  ) {
    return apiClient.get<ConsumptionRecord[]>(
      `/api/v1/homes/${homeId}/devices/${deviceId}/consumption${queryString(query)}`,
      { token },
    );
  },
  getDeviceSummary(
    homeId: string,
    deviceId: string,
    query?: ConsumptionQuery,
    token?: string,
  ) {
    return apiClient.get<ConsumptionRecord>(
      `/api/v1/homes/${homeId}/devices/${deviceId}/consumption/summary${queryString(query)}`,
      { token },
    );
  },
  getDeviceDaily(
    homeId: string,
    deviceId: string,
    query?: ConsumptionQuery,
    token?: string,
  ) {
    return apiClient.get<ConsumptionRecord[]>(
      `/api/v1/homes/${homeId}/devices/${deviceId}/consumption/daily${queryString(query)}`,
      { token },
    );
  },
};
