
/**
 * Identificación local de Shelly 1PM Gen4.
 *
 * Solo lectura.
 *
 * No crea sesiones backend.
 * No configura MQTT.
 * No registra dispositivos.
 */

export type ShellyLocalIdentity = {
  manufacturerDeviceId: string;
  modelCode: "S4SW-001P16EU";
  generation: 4;
  firmwareVersion: string | null;
};

export function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split(".");

  if (
    parts.length !== 4 ||
    parts.some((part) => !/^\d{1,3}$/.test(part))
  ) {
    return false;
  }

  const values = parts.map(Number);

  if (
    values.some(
      (value) => value < 0 || value > 255,
    )
  ) {
    return false;
  }

  const [first, second] = values;

  return (
    first === 10 ||
    (first === 172 &&
      second >= 16 &&
      second <= 31) ||
    (first === 192 && second === 168)
  );
}

export async function readShellyLocalIdentity(
  ip: string,
  signal?: AbortSignal,
): Promise<ShellyLocalIdentity> {
  if (!isPrivateIpv4(ip)) {
    throw new Error(
      "Dirección local de dispositivo no válida.",
    );
  }

  const response = await fetch(
    `http://${ip}/rpc/Shelly.GetDeviceInfo`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal,
    },
  );

  if (!response.ok) {
    throw new Error(
      `No se pudo consultar el dispositivo ` +
      `(HTTP ${response.status}).`,
    );
  }

  const raw: unknown = await response.json();

  if (
    !raw ||
    typeof raw !== "object" ||
    Array.isArray(raw)
  ) {
    throw new Error(
      "Respuesta de identidad inválida.",
    );
  }

  const info = raw as Record<string, unknown>;

  if (
    info.model !== "S4SW-001P16EU" ||
    info.gen !== 4 ||
    typeof info.id !== "string" ||
    !/^shelly1pmg4-[a-f0-9]+$/i.test(info.id)
  ) {
    throw new Error(
      "El dispositivo no reporta un " +
      "Shelly 1PM Gen4 compatible.",
    );
  }

  return {
    manufacturerDeviceId: info.id,
    modelCode: "S4SW-001P16EU",
    generation: 4,
    firmwareVersion:
      typeof info.ver === "string"
        ? info.ver
        : null,
  };
}
