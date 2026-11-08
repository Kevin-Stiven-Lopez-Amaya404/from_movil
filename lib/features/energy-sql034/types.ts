/**
 * SQL034 HTTP contract (tariffs, goals and estimated cost summary).
 * Source: smarthome-backend PR #15. Money and kWh travel as decimal text.
 */
export type DecimalString = string; // e.g. '950.2500'
export type LocalDate = string; // YYYY-MM-DD (America/Bogota)
export type Month = string; // YYYY-MM
export type IsoDateTime = string; // ISO UTC

export interface Tariff {
  id: string;
  homeId: string;
  unitPriceCopKwh: DecimalString;
  effectiveFrom: LocalDate;
  createdAt: IsoDateTime;
}

export interface TariffList {
  homeId: string;
  tariffs: Tariff[];
}

export interface CurrentTariff {
  homeId: string;
  at: LocalDate;
  tariff: Tariff | null;
}

export interface CreateTariffRequest {
  unitPriceCopKwh: DecimalString;
  effectiveFrom: LocalDate;
}

export interface Goal {
  id: string;
  homeId: string;
  month: Month;
  monthlyBudgetCop: DecimalString | null;
  targetKwh: DecimalString | null;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export interface MonthGoal {
  homeId: string;
  month: Month;
  goal: Goal | null;
}

export interface UpsertGoalRequest {
  monthlyBudgetCop: DecimalString | null; // campo requerido, null permitido
  targetKwh: DecimalString | null; // campo requerido, null permitido
}

export interface EnergySummary {
  homeId: string;
  month: Month;
  timezone: "America/Bogota";
  from: IsoDateTime;
  to: IsoDateTime;
  readingsCount: number;
  unpricedReadings: number;
  totalKwh: DecimalString;
  costComplete: boolean;
  estimatedCostCop: DecimalString | null;
  partialCostCop: DecimalString;
  monthlyBudgetCop: DecimalString | null;
  targetKwh: DecimalString | null;
  budgetUsagePercent: DecimalString | null;
  targetUsagePercent: DecimalString | null;
  currency: "COP";
}
