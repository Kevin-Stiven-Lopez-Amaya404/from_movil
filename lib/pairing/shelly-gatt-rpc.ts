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

type BleValue = { value: string | null };
type BleSubscription = { remove(): void };
type BleDevice = {
  id: string;

  discoverAllServicesAndCharacteristics(): Promise<BleDevice>;

  characteristicsForService(service: string): Promise<
    Array<{
      uuid: string;
      isReadable: boolean;
      isWritableWithResponse: boolean;
      isWritableWithoutResponse: boolean;
      isNotifiable: boolean;
    }>
  >;
};
export type ShellyBleManager = {
  connectToDevice(id: string): Promise<BleDevice>;

  isDeviceConnected(deviceId: string): Promise<boolean>;

  onDeviceDisconnected(
    deviceId: string,
    listener: (
      error: Error | null,
      device: BleDevice | null,
    ) => void,
  ): BleSubscription;

  cancelDeviceConnection(id: string): Promise<BleDevice>;

  requestMTUForDevice(id: string, mtu: number): Promise<{ mtu: number }>;

  writeCharacteristicWithResponseForDevice(
    deviceId: string,
    service: string,
    characteristic: string,
    value: string,
  ): Promise<BleValue>;

  readCharacteristicForDevice(
    deviceId: string,
    service: string,
    characteristic: string,
  ): Promise<BleValue>;
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

async function waitForResponseLength(
  manager: ShellyBleManager,
  deviceId: string,
): Promise<number> {
  console.log("[ShellyBLE] 4A - Consultando RX");

  for (let attempt = 1; attempt <= 20; attempt++) {
    const characteristic = await withTimeout(
      manager.readCharacteristicForDevice(
        deviceId,
        SHELLY_RPC_SERVICE_UUID,
        SHELLY_RPC_RX_UUID,
      ),
      "Tiempo agotado leyendo RX",
    );

    if (characteristic.value) {
      const bytes = base64ToBytes(characteristic.value);
      const length = readUint32BigEndian(bytes);

      if (length > MAX_FRAME_BYTES) {
        throw new PairingError(
          "Longitud RX fuera de límite",
          "INVALID_STATE",
        );
      }

      if (length > 0) {
        console.log(
          "[ShellyBLE] 4B - Respuesta disponible",
          length,
        );
        return length;
      }
    }

    await new Promise<void>((resolve) =>
      setTimeout(resolve, 250),
    );
  }

  throw new PairingError(
    "Shelly no entregó respuesta RPC por RX",
    "DEVICE_DISCONNECTED",
  );
}

async function readResponseFrame(
  manager: ShellyBleManager,
  deviceId: string,
  expectedLength: number,
): Promise<Uint8Array> {
  if (expectedLength < 1 || expectedLength > MAX_FRAME_BYTES) {
    throw new PairingError("Shelly reportó una respuesta fuera de límite.", "INVALID_STATE");
  }
  const chunks: Uint8Array[] = [];
  let totalLength = 0;
  for (let reads = 0; totalLength < expectedLength && reads < 256; reads += 1) {
    const characteristic = await withTimeout(
      manager.readCharacteristicForDevice(
        deviceId,
        SHELLY_RPC_SERVICE_UUID,
        SHELLY_RPC_DATA_UUID,
      ),
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
  let disconnectSub: BleSubscription | null = null;
  try {
    connectionAttempted = true;
    console.log("[ShellyBLE] 1 - Conectando");
    console.log("[ShellyBLE] Iniciando conexión sin timeout nativo");
    const device = await withTimeout(
      manager.connectToDevice(deviceId),
      "No se pudo conectar al Shelly por BLE.",
    );
    console.log("[ShellyBLE] Conexión GATT establecida");

    disconnectSub = manager.onDeviceDisconnected(
      deviceId,
      (error) => {
        const bleError = error as (Error & {
          errorCode?: number;
          androidErrorCode?: number;
          attErrorCode?: number;
        }) | null;

        console.warn("[ShellyBLE] EVENTO DESCONEXIÓN", {
          errorCode: bleError?.errorCode ?? null,
          androidErrorCode: bleError?.androidErrorCode ?? null,
          attErrorCode: bleError?.attErrorCode ?? null,
        });
      },
    );

    console.log("[ShellyBLE] 2 - Descubriendo GATT");
    await withTimeout(
      device.discoverAllServicesAndCharacteristics(),
      "No se pudieron descubrir los servicios GATT del Shelly.",
    );

    const characteristics = await withTimeout(
      device.characteristicsForService(
        SHELLY_RPC_SERVICE_UUID,
      ),
      "No se pudieron consultar las caracter\u00edsticas RPC.",
    );

    console.log(
      "[ShellyBLE] Propiedades GATT:",
      characteristics.map((c) => ({
        uuid: c.uuid.slice(-12),
        read: c.isReadable,
        writeWithResponse: c.isWritableWithResponse,
        writeWithoutResponse: c.isWritableWithoutResponse,
        notify: c.isNotifiable,
      })),
    );

    const mtuPayloadBytes = 20;

    console.log(
      "[ShellyBLE] POC sin negociación MTU",
    );

    console.log(
      "[ShellyBLE] Tamaño de fragmento DATA:",
      mtuPayloadBytes,
    );

    const requestId = Math.floor(Math.random() * 0x7fffffff) + 1;
    const request = encodeShellyRpcFrame(
      JSON.stringify({
        id: requestId,
        src: "smarthome-mobile-poc",
        method: "Shelly.GetDeviceInfo",
      }),
    );
    console.log("[ShellyBLE] 3 - Preparando RPC");

    const connected = await manager.isDeviceConnected(
      deviceId,
    );

    console.log(
      "[ShellyBLE] ¿Conectado antes de TX?",
      connected,
    );

    if (!connected) {
      throw new PairingError(
        "Shelly se desconectó antes de escribir TX.",
        "DEVICE_DISCONNECTED",
      );
    }

    // POC diagnóstica Shelly 2.0+: en Android el primer ATT_WRITE_REQ
    // se observó antes del evento HCI Encryption Change. Esta espera
    // permite evaluar si el rechazo 0x03 depende de ese orden.
    // No constituye una comprobación de enlace cifrado ni solución final.
    console.log("[ShellyBLE] 3B - Espera diagnóstica previa a TX (1500 ms)");
    await new Promise<void>((resolve) => setTimeout(resolve, 1500));

    if (!(await manager.isDeviceConnected(deviceId))) {
      throw new PairingError(
        "Shelly se desconectó durante la espera previa a TX.",
        "DEVICE_DISCONNECTED",
      );
    }

    console.log("[ShellyBLE] 3C - Escribiendo longitud TX");

    await withTimeout(
      manager.writeCharacteristicWithResponseForDevice(
        deviceId,
        SHELLY_RPC_SERVICE_UUID,
        SHELLY_RPC_TX_UUID,
        bytesToBase64(uint32BigEndian(request.length)),
      ),
      "Tiempo agotado al escribir TX",
    );

    console.log("[ShellyBLE] 3D - Escritura TX correcta");

    for (
      let offset = 0;
      offset < request.length;
      offset += mtuPayloadBytes
    ) {
      console.log(
        "[ShellyBLE] 3E - Escribiendo DATA, offset:",
        offset,
      );

      await withTimeout(
        manager.writeCharacteristicWithResponseForDevice(
          deviceId,
          SHELLY_RPC_SERVICE_UUID,
          SHELLY_RPC_DATA_UUID,
          bytesToBase64(
            request.subarray(
              offset,
              offset + mtuPayloadBytes,
            ),
          ),
        ),
        "Tiempo agotado al escribir DATA",
      );

      console.log(
        "[ShellyBLE] 3F - Escritura DATA correcta",
      );
    }

    console.log("[ShellyBLE] 4 - Leyendo respuesta RX");

    const responseLength = await waitForResponseLength(
      manager,
      deviceId,
    );

    const responseFrame = await readResponseFrame(
      manager,
      deviceId,
      responseLength,
    );

    console.log("[ShellyBLE] 5 - Respuesta RPC recibida");

    return decodeShellyRpcResponse(
      responseFrame,
      requestId,
    );
  } catch (error) {
    const bleError = error as Error & {
      errorCode?: number | string;
      attErrorCode?: number | null;
      androidErrorCode?: number | null;
      reason?: string | null;
    };

    console.log("[ShellyBLE] Detalle del rechazo:", {
      message: bleError.message,
      errorCode: bleError.errorCode,
      attErrorCode: bleError.attErrorCode,
      androidErrorCode: bleError.androidErrorCode,
      reason: bleError.reason,
    });

    console.error(
      "[ShellyBLE] ERROR ORIGINAL DE LECTURA GATT:",
      error,
    );

    if (error instanceof PairingError) {
      throw error;
    }

    const detail =
      error instanceof Error
        ? error.message
        : "Error Bluetooth desconocido";

    throw new PairingError(
      `Fall\u00f3 la lectura GATT: ${detail}`,
      "DEVICE_DISCONNECTED",
    );
  } finally {
    disconnectSub?.remove();
    if (connectionAttempted) {
      console.log("[ShellyBLE] Cerrando conexión GATT...");

      try {
        await withTimeout(
          manager.cancelDeviceConnection(deviceId),
          "Tiempo agotado al cerrar conexión BLE.",
        );
      } catch (error) {
        console.warn(
          "[ShellyBLE] No se pudo cerrar GATT normalmente:",
          error,
        );
      }

      console.log("[ShellyBLE] Finalizada la operación BLE.");
    }
  }
}
