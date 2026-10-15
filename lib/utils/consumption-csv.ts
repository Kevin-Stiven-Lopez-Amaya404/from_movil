import type { HomeDailyConsumptionRecord } from "@/lib/services/consumption-service";

type HomeConsumptionCsvInput = {
  homeName: string;
  periodLabel: string;
  records: HomeDailyConsumptionRecord[];
};

function escapeCsvText(value: string): string {
  // Evitar que Excel interprete nombres como formulas.
  const safeValue = /^\s*[=+\-@]/.test(value) ? `'${value}` : value;

  return `"${safeValue.replace(/"/g, '""')}"`;
}

export function buildHomeConsumptionCsv({
  homeName,
  periodLabel,
  records,
}: HomeConsumptionCsvInput): string {
  if (!homeName.trim()) {
    throw new Error("No se ha seleccionado un hogar valido.");
  }

  if (records.length === 0) {
    throw new Error("No existen mediciones para exportar.");
  }

  const header = [
    "Hogar",
    "Periodo consultado",
    "Fecha",
    "Consumo (kWh)",
  ].join(";");

  const rows = [...records]
    .sort((a, b) => a.periodStart.localeCompare(b.periodStart))
    .map((record) => {
      const value = record.totalEnergyDeltaKwh;

      if (
        !Number.isFinite(value) ||
        value < 0 ||
        !/^\d{4}-\d{2}-\d{2}/.test(record.periodStart)
      ) {
        throw new Error("El backend devolvio mediciones invalidas.");
      }

      return [
        escapeCsvText(homeName),
        escapeCsvText(periodLabel),
        escapeCsvText(record.periodStart.slice(0, 10)),
        value.toFixed(9).replace(".", ","),
      ].join(";");
    });

  // BOM UTF-8 para conservar acentos al abrir en Excel.
  return `\uFEFF${[header, ...rows].join("\r\n")}\r\n`;
}
