export type PairingSessionStatus =
  | "PENDING"
  | "DEVICE_IDENTIFIED"
  | "WAITING_FOR_MQTT"
  | "CONNECTED"
  | "COMPLETED"
  | "EXPIRED"
  | "CANCELLED"
  | "FAILED";

export type PairingSession = {
  sessionId: string;
  homeId: string;
  method: "LAN" | "AP";
  status: PairingSessionStatus;
  expiresAt: string;

  identity: {
    manufacturerDeviceId: string;
    modelCode: string;
    generation: number;
    firmwareVersion: string | null;
    reportedAt: string | null;
    verification: string;
  } | null;

  completion: {
    deviceId: string | null;
    ready?: boolean;
  } | null;

  failureCode: string | null;
};

export type NearbyShelly = {
  id: string;
  name?: string;
  rssi?: number;
  connected: boolean;
};

export type BlePermissionStatus =
  | "unknown"
  | "granted"
  | "denied"
  | "unavailable";

export type PairingErrorCode =
  | "BLE_UNAVAILABLE"
  | "BLE_PERMISSION_DENIED"
  | "DEVICE_NOT_FOUND"
  | "DEVICE_DISCONNECTED"
  | "PAIRING_UNSUPPORTED"
  | "PAIRING_EXPIRED"
  | "INVALID_STATE";

export class PairingError extends Error {
  constructor(
    message: string,
    public readonly code: PairingErrorCode,
  ) {
    super(message);
    this.name = "PairingError";
  }
}
