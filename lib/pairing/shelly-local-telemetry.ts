/**
 * Diagnostico LAN de solo lectura para Shelly 1PM Gen4.
 * No realiza pairing ni escribe estados en backend o BD.
 * No acciona el rele. Nunca envia credenciales.
 */
import {
  isPrivateIpv4,
  readShellyLocalIdentity,
} from "@/lib/pairing/shelly-local-identity";

export type ShellyLocalTelemetry = {
  output: boolean;
  activePowerWatts: number;
  totalEnergyWh: number;
  measuredAt: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function readShellyLocalTelemetry(
  ip: string,
  expectedManufacturerId: string,
  signal?: AbortSignal,
): Promise<ShellyLocalTelemetry> {
  if (!isPrivateIpv4(ip) || !/^shelly1pmg4-[a-f0-9]+$/i.test(expectedManufacturerId)) {
    throw new Error("La identidad o IP local del Shelly no es valida.");
  }

  // Revalidar identidad en cada lectura: no confiar solo en una IP reutilizada.
  const identity = await readShellyLocalIdentity(ip, signal);
  if (
    identity.manufacturerDeviceId.toLowerCase() !==
    expectedManufacturerId.toLowerCase()
  ) {
    throw new Error("El Shelly en esta direccion IP ya no es el seleccionado.");
  }

  const response = await fetch(
    `http://${ip}/rpc/Switch.GetStatus?id=0`,
    {
      method: "GET",
      headers: { Accept: "application/json" },
      signal,
    },
  );

  if (!response.ok) {
    throw new Error(`No se pudo leer el rele (HTTP ${response.status}).`);
  }

  const raw: unknown = await response.json();
  if (!isRecord(raw) || !isRecord(raw.aenergy)) {
    throw new Error("La respuesta del Shelly no contiene telemetria valida.");
  }

  const output = raw.output;
  const activePowerWatts = raw.apower;
  const totalEnergyWh = raw.aenergy.total;

  if (
    raw.id !== 0 ||
    typeof output !== "boolean" ||
    typeof activePowerWatts !== "number" ||
    !Number.isFinite(activePowerWatts) ||
    typeof totalEnergyWh !== "number" ||
    !Number.isFinite(totalEnergyWh) ||
    totalEnergyWh < 0
  ) {
    throw new Error("Los valores recibidos del Shelly no son validos.");
  }

  return {
    output,
    activePowerWatts,
    totalEnergyWh,
    measuredAt: Date.now(),
  };
}
