import { PairingError } from "./pairing-types";

export const SHELLY_RPC_SERVICE_UUID =
  "5f6d4f53-5f52-5043-5f53-56435f49445f";
export const SHELLY_RPC_DATA_UUID =
  "5f6d4f53-5f52-5043-5f64-6174615f5f5f";
export const SHELLY_RPC_TX_UUID =
  "5f6d4f53-5f52-5043-5f74-785f63746c5f";
export const SHELLY_RPC_RX_UUID =
  "5f6d4f53-5f52-5043-5f72-785f63746c5f";

const RPC_TIMEOUT_MS = 8_000;
const MAX_FRAME_BYTES = 4_096;
const DEFAULT_ATT_PAYLOAD_BYTES = 20;

type BleValue = { value: string | null };
type BleSubscription = { remove(): void };
type BleDevice = {
  id: string;
  discoverAllServicesAndCharacteristics(): Promise<BleDevice>;
};
export type ShellyBleManager = {
  connectToDevice(id: string, options?: { timeout?: number }): Promise<BleDevice>;
  cancelDeviceConnection(id: string): Promise<BleDevice>;
  requestMTUForDevice(id: string, mtu: number): Promise<{ mtu: number }>;
  writeCharacteristicWithResponseForService(
    service: string,
    characteristic: string,
    value: string,
  ): Promise<BleValue>;
  readCharacteristicForService(
    service: string,
    characteristic: string,
  ): Promise<BleValue>;
  monitorCharacteristicForService(
    service: string,
    characteristic: string,
    listener: (error: Error | null, value: BleValue | null) => void,
  ): BleSubscription;
};

export type ShellyDeviceInfo = {
  id?: string;
  mac?: string;
  model?: string;
  fw_id?: string;
  ver?: string;
  app?: string;
  gen?: number;
  provision?: "pending" | "confirmed" | "complete" | "locked" | string;
};

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 1) {
    binary += String.fromCharCode(bytes[offset]);
  }
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let offset = 0; offset < binary.length; offset += 1) {
    bytes[offset] = binary.charCodeAt(offset);
  }
  return bytes;
}

function uint32BigEndian(value: number): Uint8Array {
  if (!Number.isSafeInteger(value) || value < 0 || value > 0xffffffff) {
    throw new PairingError("Longitud RPC inválida.", "INVALID_STATE");
  }
  return new Uint8Array([
    (value >>> 24) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 8) & 0xff,
    value & 0xff,
  ]);
}

function readUint32BigEndian(bytes: Uint8Array): number {
  if (bytes.length !== 4) {
    throw new PairingError("Longitud RPC incompleta.", "INVALID_STATE");
  }
  return (
    bytes[0] * 0x1000000 +
    (bytes[1] << 16) +
    (bytes[2] << 8) +
    bytes[3]
  );
}

function utf8Encode(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function utf8Decode(value: Uint8Array): string {
  return new TextDecoder("utf-8", { fatal: true }).decode(value);
}

export function encodeShellyRpcFrame(value: string): Uint8Array {
  const frame = utf8Encode(value);
  if (frame.length === 0 || frame.length > MAX_FRAME_BYTES) {
    throw new PairingError("El marco RPC supera el límite permitido.", "INVALID_STATE");
  }
  return frame;
}

export function decodeShellyRpcResponse(
  frame: Uint8Array,
  expectedId: number,
): ShellyDeviceInfo {
  let parsed: unknown;
  try {
    parsed = JSON.parse(utf8Decode(frame));
  } catch {
    throw new PairingError("Shelly devolvió una respuesta RPC inválida.", "INVALID_STATE");
  }
  if (!parsed || typeof parsed !== "object") {
    throw new PairingError("Shelly devolvió una respuesta RPC vacía.", "INVALID_STATE");
  }
  const response = parsed as {
    id?: unknown;
    result?: unknown;
    error?: unknown;
  };
  if (response.id !== expectedId || response.error !== undefined) {
    throw new PairingError("Shelly rechazó la consulta RPC.", "INVALID_STATE");
  }
  if (!response.result || typeof response.result !== "object") {
    throw new PairingError("La identidad Shelly no está en la respuesta RPC.", "INVALID_STATE");
  }
  return response.result as ShellyDeviceInfo;
}

function withTimeout<T>(promise: Promise<T>, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      timer = setTimeout(
        () => reject(new PairingError(message, "DEVICE_DISCONNECTED")),
        RPC_TIMEOUT_MS,
      );
    }),
  ]).finally(() => clearTimeout(timer));
}

function waitForResponseLength(
  manager: ShellyBleManager,
): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    let settled = false;
    let subscription: BleSubscription;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      subscription.remove();
      reject(new PairingError("Shelly no respondió a tiempo por BLE.", "DEVICE_DISCONNECTED"));
    }, RPC_TIMEOUT_MS);
    subscription = manager.monitorCharacteristicForService(
      SHELLY_RPC_SERVICE_UUID,
      SHELLY_RPC_RX_UUID,
      (error, characteristic) => {
        if (settled) return;
        if (error) {
          settled = true;
          clearTimeout(timer);
          subscription.remove();
          reject(new PairingError("Falló la lectura de respuesta BLE.", "DEVICE_DISCONNECTED"));
          return;
        }
        if (!characteristic?.value) return;
        settled = true;
        clearTimeout(timer);
        subscription.remove();
        try {
          resolve(readUint32BigEndian(base64ToBytes(characteristic.value)));
        } catch (reason) {
          reject(reason instanceof Error ? reason : new Error("Respuesta RX inválida."));
        }
      },
    );
  });
}

async function readResponseFrame(
  manager: ShellyBleManager,
  expectedLength: number,
): Promise<Uint8Array> {
  if (expectedLength < 1 || expectedLength > MAX_FRAME_BYTES) {
    throw new PairingError("Shelly reportó una respuesta fuera de límite.", "INVALID_STATE");
  }
  const chunks: Uint8Array[] = [];
  let totalLength = 0;
  for (let reads = 0; totalLength < expectedLength && reads < 256; reads += 1) {
    const characteristic = await withTimeout(
      manager.readCharacteristicForService(SHELLY_RPC_SERVICE_UUID, SHELLY_RPC_DATA_UUID),
      "Se agotó el tiempo leyendo la respuesta de Shelly.",
    );
    if (!characteristic.value) {
      throw new PairingError("Shelly devolvió un bloque BLE vacío.", "INVALID_STATE");
    }
    const bytes = base64ToBytes(characteristic.value);
    const remaining = expectedLength - totalLength;
    const chunk = bytes.subarray(0, remaining);
    if (chunk.length === 0) {
      throw new PairingError("Shelly devolvió un bloque BLE inválido.", "INVALID_STATE");
    }
    chunks.push(chunk);
    totalLength += chunk.length;
  }
  if (totalLength !== expectedLength) {
    throw new PairingError("La respuesta BLE quedó incompleta.", "INVALID_STATE");
  }
  const frame = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    frame.set(chunk, offset);
    offset += chunk.length;
  }
  return frame;
}

export async function readShellyDeviceInfo(
  manager: ShellyBleManager,
  deviceId: string,
): Promise<ShellyDeviceInfo> {
  if (!deviceId.trim()) {
    throw new PairingError("Selecciona un Shelly detectado.", "DEVICE_NOT_FOUND");
  }

  let connectionAttempted = false;
  try {
    connectionAttempted = true;
    const device = await withTimeout(
      manager.connectToDevice(deviceId, { timeout: RPC_TIMEOUT_MS }),
      "No se pudo conectar al Shelly por BLE.",
    );
    await withTimeout(
      device.discoverAllServicesAndCharacteristics(),
      "No se pudieron descubrir los servicios GATT del Shelly.",
    );

    let mtuPayloadBytes = DEFAULT_ATT_PAYLOAD_BYTES;
    try {
      const negotiated = await manager.requestMTUForDevice(deviceId, 247);
      mtuPayloadBytes = Math.max(DEFAULT_ATT_PAYLOAD_BYTES, negotiated.mtu - 3);
    } catch {
      // Keep the BLE default payload when MTU negotiation is unsupported.
    }

    const requestId = Math.floor(Math.random() * 0x7fffffff) + 1;
    const request = encodeShellyRpcFrame(
      JSON.stringify({
        id: requestId,
        src: "smarthome-mobile-poc",
        method: "Shelly.GetDeviceInfo",
      }),
    );
    const responseLengthPromise = waitForResponseLength(manager);
    await withTimeout(
      manager.writeCharacteristicWithResponseForService(
        SHELLY_RPC_SERVICE_UUID,
        SHELLY_RPC_TX_UUID,
        bytesToBase64(uint32BigEndian(request.length)),
      ),
      "No se pudo iniciar la solicitud RPC BLE.",
    );
    for (let offset = 0; offset < request.length; offset += mtuPayloadBytes) {
      await withTimeout(
        manager.writeCharacteristicWithResponseForService(
          SHELLY_RPC_SERVICE_UUID,
          SHELLY_RPC_DATA_UUID,
          bytesToBase64(request.subarray(offset, offset + mtuPayloadBytes)),
        ),
        "No se pudo enviar la solicitud RPC BLE.",
      );
    }
    const responseLength = await withTimeout(
      responseLengthPromise,
      "Shelly no respondió a la consulta de identidad.",
    );
    const responseFrame = await readResponseFrame(manager, responseLength);
    return decodeShellyRpcResponse(responseFrame, requestId);
  } catch (error) {
    if (error instanceof PairingError) throw error;
    throw new PairingError("No se pudo consultar Shelly por BLE.", "DEVICE_DISCONNECTED");
  } finally {
    if (connectionAttempted) {
      await manager.cancelDeviceConnection(deviceId).catch(() => undefined);
    }
  }
}
