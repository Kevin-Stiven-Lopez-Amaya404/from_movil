import {
    PairingError,
    type BlePermissionStatus,
    type NearbyShelly,
} from "./pairing-types";

export interface BleAdapter {
  getPermissionStatus(): Promise<BlePermissionStatus>;
  requestPermission(): Promise<BlePermissionStatus>;
  discover(timeoutMs?: number): Promise<NearbyShelly[]>;
  connect(deviceId: string): Promise<void>;
  disconnect(deviceId: string): Promise<void>;
}

/**
 * Adapter explícito hasta disponer de un development build con BLE nativo.
 * No simula dispositivos ni permite que la UI presente un pairing falso.
 */
export const unavailableBleAdapter: BleAdapter = {
  async getPermissionStatus() {
    return "unavailable";
  },
  async requestPermission() {
    return "unavailable";
  },
  async discover() {
    throw new PairingError(
      "El descubrimiento BLE requiere una compilación de desarrollo con soporte nativo.",
      "BLE_UNAVAILABLE",
    );
  },
  async connect() {
    throw new PairingError(
      "El descubrimiento BLE no está disponible en esta compilación.",
      "BLE_UNAVAILABLE",
    );
  },
  async disconnect() {},
};
