
import type { HomeDailyConsumptionRecord } from "@/lib/services/consumption-service";
import type { DeviceConsumptionRankingResult } from "@/lib/services/device-consumption-ranking";

export type HomeConsumptionPdfInput = {
  homeName: string;
  periodLabel: string;
  totalEnergyDeltaKwh: number;
  readingsCount: number;
  records: HomeDailyConsumptionRecord[];
  ranking: DeviceConsumptionRankingResult;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatKwh(value: number): string {
  return value.toLocaleString("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  });
}

function isValidEnergy(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

export function buildHomeConsumptionPdfHtml(
  input: HomeConsumptionPdfInput,
): string {
  const {
    homeName,
    periodLabel,
    totalEnergyDeltaKwh,
    readingsCount,
    records,
    ranking,
  } = input;

  if (!homeName.trim() || !periodLabel.trim()) {
    throw new Error("Faltan datos del hogar o del periodo.");
  }

  if (
    !isValidEnergy(totalEnergyDeltaKwh) ||
    !Number.isSafeInteger(readingsCount) ||
    readingsCount < 0
  ) {
    throw new Error("El resumen de consumo contiene datos inválidos.");
  }

  if (
    records.some(
      (record) =>
        typeof record.periodStart !== "string" ||
        !isValidEnergy(record.totalEnergyDeltaKwh),
    )
  ) {
    throw new Error("El historial diario contiene datos inválidos.");
  }

  if (
    ranking.topDevices.some(
      (device) =>
        !device.deviceName.trim() ||
        !isValidEnergy(device.totalEnergyDeltaKwh) ||
        !Number.isSafeInteger(device.readingsCount) ||
        device.readingsCount < 0,
    )
  ) {
    throw new Error("El ranking contiene datos inválidos.");
  }

  const dailyRows = [...records]
    .sort((a, b) => a.periodStart.localeCompare(b.periodStart))
    .map(
      (record) => `
        <tr>
          <td>${escapeHtml(record.periodStart.slice(0, 10))}</td>
          <td class="numeric">${formatKwh(record.totalEnergyDeltaKwh)}</td>
        </tr>
      `,
    )
    .join("");

  const rankingRows = ranking.topDevices
    .map(
      (device, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(device.deviceName)}</td>
          <td class="numeric">${formatKwh(device.totalEnergyDeltaKwh)}</td>
        </tr>
      `,
    )
    .join("");

  const emptyDailyRow = `
    <tr>
      <td colspan="2" class="empty">
        No hay registros diarios disponibles.
      </td>
    </tr>
  `;

  const emptyRankingMessage =
    ranking.deviceCount === 0
      ? "El hogar no tiene dispositivos activos."
      : ranking.measuredDeviceCount === 0
        ? "No hay mediciones de dispositivos en este periodo."
        : "No hay consumo positivo de dispositivos en este periodo.";

  const emptyRankingRow = `
    <tr>
      <td colspan="3" class="empty">
        ${emptyRankingMessage}
      </td>
    </tr>
  `;

  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <title>Informe de consumo energético</title>

        <style>
          @page {
            size: A4;
            margin: 18mm;
          }

          body {
            margin: 0;
            color: #17243B;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 11px;
            line-height: 1.5;
          }

          h1 {
            font-size: 22px;
            margin: 0 0 6px;
          }

          h2 {
            font-size: 14px;
            margin: 26px 0 12px;
          }

          .subtitle {
            color: #64748B;
            margin-bottom: 24px;
          }

          .summary {
            width: 100%;
            border-collapse: separate;
            border-spacing: 8px;
            margin-bottom: 20px;
          }

          .summary td {
            width: 50%;
            padding: 14px;
            background: #F1F5F9;
            border-radius: 8px;
          }

          .metric-label {
            color: #64748B;
            font-size: 10px;
          }

          .metric-value {
            font-size: 20px;
            font-weight: bold;
            margin-top: 5px;
          }

          .data-table {
            width: 100%;
            border-collapse: collapse;
          }

          .data-table th {
            color: #475569;
            background: #F1F5F9;
            text-align: left;
          }

          .data-table th,
          .data-table td {
            padding: 9px 10px;
            border-bottom: 1px solid #E2E8F0;
          }

          .numeric {
            text-align: right !important;
          }

          .empty {
            color: #64748B;
            text-align: center;
            padding: 18px !important;
          }

          tr {
            page-break-inside: avoid;
          }

          .footer {
            margin-top: 30px;
            padding-top: 12px;
            border-top: 1px solid #E2E8F0;
            color: #64748B;
            font-size: 9px;
          }
        </style>
      </head>

      <body>
        <h1>Informe de consumo energético</h1>

        <div class="subtitle">
          SmartHome · ${escapeHtml(homeName)}
          <br />
          Periodo: ${escapeHtml(periodLabel)}
        </div>

        <table class="summary">
          <tr>
            <td>
              <div class="metric-label">Consumo total</div>
              <div class="metric-value">
                ${formatKwh(totalEnergyDeltaKwh)} kWh
              </div>
            </td>
            <td>
              <div class="metric-label">Mediciones registradas</div>
              <div class="metric-value">${readingsCount}</div>
            </td>
          </tr>
        </table>

        <h2>Historial diario</h2>

        <table class="data-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th class="numeric">Consumo (kWh)</th>
            </tr>
          </thead>
          <tbody>
            ${dailyRows || emptyDailyRow}
          </tbody>
        </table>

        <h2>Dispositivos con mayor consumo</h2>

        <table class="data-table">
          <thead>
            <tr>
              <th>Posición</th>
              <th>Dispositivo</th>
              <th class="numeric">Consumo (kWh)</th>
            </tr>
          </thead>
          <tbody>
            ${rankingRows || emptyRankingRow}
          </tbody>
        </table>

        <div class="footer">
          Fuente: mediciones de consumo registradas en SmartHome.
          El ranking considera dispositivos activos con consumo positivo.
          No incluye estimaciones de costos económicos.
        </div>
      </body>
    </html>
  `;
}