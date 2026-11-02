import { apiClient } from "@/lib/api/api-client";
import type {
  CreateTariffRequest,
  CurrentTariff,
  EnergySummary,
  Goal,
  MonthGoal,
  Tariff,
  TariffList,
  UpsertGoalRequest,
} from "@/lib/features/energy-sql034/types";

/** Endpoints SQL034: /api/v1/homes/:homeId/energy/... */
const base = (homeId: string) =>
  `/api/v1/homes/${encodeURIComponent(homeId)}/energy`;

export const energyService = {
  listTariffs(homeId: string) {
    return apiClient.get<TariffList>(`${base(homeId)}/tariffs`);
  },

  currentTariff(homeId: string, at?: string) {
    const query = at ? `?at=${at}` : "";
    return apiClient.get<CurrentTariff>(
      `${base(homeId)}/tariffs/current${query}`,
    );
  },

  createTariff(homeId: string, body: CreateTariffRequest) {
    return apiClient.post<Tariff, CreateTariffRequest>(
      `${base(homeId)}/tariffs`,
      body,
    );
  },

  getGoal(homeId: string, month?: string) {
    const query = month ? `?month=${month}` : "";
    return apiClient.get<MonthGoal>(`${base(homeId)}/goals${query}`);
  },

  saveGoal(homeId: string, month: string, body: UpsertGoalRequest) {
    return apiClient.put<Goal, UpsertGoalRequest>(
      `${base(homeId)}/goals/${month}`,
      body,
    );
  },

  getSummary(homeId: string, month?: string) {
    const query = month ? `?month=${month}` : "";
    return apiClient.get<EnergySummary>(`${base(homeId)}/summary${query}`);
  },
};
