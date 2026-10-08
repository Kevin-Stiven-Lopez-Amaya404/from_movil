export type PairingSessionStatus =
  | "PENDING"
  | "DEVICE_IDENTIFIED"
  | "BROKER_CONFIGURED"
  | "CONNECTED"
  | "COMPLETED"
  | "EXPIRED"
  | "CANCELLED"
  | "FAILED";

export type PairingSession = {
  id: string;
  homeId: string;
  status: PairingSessionStatus;
  deviceId?: string;
  expiresAt?: string;
  error?: string;
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
