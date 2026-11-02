export type DecimalKind = "tariff" | "budget" | "target";

export type DecimalInputResult =
  | { ok: true; value: string }
  | { ok: false; empty: boolean; error: string };

export type OptionalDecimalInputResult =
  | { ok: true; value: string | null }
  | { ok: false; empty: boolean; error: string };

export type EnergyAccess = { canRequest: boolean; canManage: boolean };

export type EnergyErrorLike = {
  status?: number;
  code?: string;
  serverCode?: string;
  message?: string;
} | null | undefined;

export const TIMEZONE: "America/Bogota";
export function todayBogota(date?: Date): string;
export function currentMonthBogota(date?: Date): string;
export function isValidMonth(value: unknown): boolean;
export function isValidLocalDate(value: unknown): boolean;
export function shiftMonth(month: string, delta: number): string;
export function lastDayOfMonth(month: string): string;
export function referenceDateForMonth(month: string, today?: string): string;
export function formatMonthLabel(month: string): string;
export function formatLocalDate(value: string): string;
export function formatIsoDateBogota(value: string): string;
export function normalizeDecimalInput(
  raw: string,
  kind: DecimalKind,
): DecimalInputResult;
export function normalizeOptionalDecimalInput(
  raw: string,
  kind: DecimalKind,
): OptionalDecimalInputResult;
export function trimDecimalZeros(value: string | null | undefined): string;
export function formatDecimalEsCo(
  value: string | null | undefined,
  maxDecimals: number,
): string;
export function formatCop(value: string | null | undefined): string;
export function formatKwh(value: string | null | undefined): string;
export function formatTariff(value: string | null | undefined): string;
export function formatPercent(value: string | null | undefined): string;
export function overLimitPercent(value: string | null | undefined): string | null;
export function barWidthPercent(value: string | null | undefined): number;
export function getEnergyAccess(homeRole?: string): EnergyAccess;
export function isForbiddenError(error: unknown): boolean;
export function energyErrorMessage(error: unknown): string;
