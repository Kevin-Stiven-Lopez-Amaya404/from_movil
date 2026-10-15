import { PermissionsAndroid, Platform } from "react-native";

import {
  PairingError,
  type BlePermissionStatus,
  type NearbyShelly,
} from "./pairing-types";

export interface BleAdapter {
  getPermissionStatus(): Promise<BlePermissionStatus>;
  requestPermission(): Promise<BlePermissionStatus>;
  discover(timeoutMs?: number): Promise<NearbyShelly[]>;
  cancelDiscovery(): Promise<void>;
  connect(deviceId: string): Promise<void>;
  disconnect(deviceId: string): Promise<void>;
}

type NativeBleDevice = {
  id: string;
  name: string | null;
  localName: string | null;
  rssi: number | null;
};

type NativeBleManager = {
  state(): Promise<string>;
  startDeviceScan(
    serviceUUIDs: string[] | null,
    options: { allowDuplicates?: boolean } | null,
    listener: (error: Error | null, device: NativeBleDevice | null) => void,
  ): Promise<void>;
  stopDeviceScan(): Promise<void>;
};

type ActiveScan = {
  devices: Map<string, NearbyShelly>;
  finish: () => void;
  timer: ReturnType<typeof setTimeout>;
};

const ANDROID_SCAN = PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN;
const ANDROID_CONNECT = PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT;
const ANDROID_LOCATION = PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION;

let manager: NativeBleManager | null = null;
let activeScan: ActiveScan | null = null;

function requiredPermissions(): string[] {
  if (Number(Platform.Version) >= 31) {
    return [ANDROID_SCAN, ANDROID_CONNECT, ANDROID_LOCATION];
  }
  return [ANDROID_LOCATION];
}

async function hasRequiredPermissions(): Promise<boolean> {
  if (Platform.OS !== "android") return false;
  const permissions = requiredPermissions();
  const granted = await Promise.all(
    permissions.map((permission) =>
      PermissionsAndroid.check(permission as never),
    ),
  );
  return granted.every(Boolean);
}

function getNativeManager(): NativeBleManager {
  if (Platform.OS !== "android") {
    throw new PairingError(
      "La POC BLE está habilitada solo para Android.",
      "BLE_UNAVAILABLE",
    );
  }
  if (!manager) {
    try {
      // Lazy loading lets Expo Go and web render the explicit unavailable state.
      const nativeModule = require("@sfourdrinier/react-native-ble-plx");
      manager = new nativeModule.BleManager() as NativeBleManager;
    } catch {
      throw new PairingError(
        "BLE requiere instalar el build de desarrollo con el módulo nativo.",
        "BLE_UNAVAILABLE",
      );
    }
  }
  return manager;
}

async function stopActiveScan(): Promise<void> {
  const scan = activeScan;
  if (!scan) return;
  activeScan = null;
  clearTimeout(scan.timer);
  try {
    await manager?.stopDeviceScan();
  } finally {
    scan.finish();
  }
}

async function failActiveScan(reject: (error: Error) => void, message: string): Promise<void> {
  const scan = activeScan;
  if (scan) {
    activeScan = null;
    clearTimeout(scan.timer);
    try {
      await manager?.stopDeviceScan();
    } catch {
      // Preserve the original scan error.
    }
  }
  reject(new PairingError(message, "BLE_UNAVAILABLE"));
}

export const bleAdapter: BleAdapter = {
  async getPermissionStatus() {
    if (Platform.OS !== "android") return "unavailable";
    return (await hasRequiredPermissions()) ? "granted" : "denied";
  },
  async requestPermission() {
    if (Platform.OS !== "android") return "unavailable";
    const permissions = requiredPermissions();
    const results = await PermissionsAndroid.requestMultiple(
      permissions as never,
    );
    return permissions.every(
      (permission) =>
        results[permission as keyof typeof results] ===
        PermissionsAndroid.RESULTS.GRANTED,
    )
      ? "granted"
      : "denied";
  },
  async discover(timeoutMs = 10_000) {
    if (!(await hasRequiredPermissions())) {
      throw new PairingError(
        "Concede los permisos Bluetooth y ubicación para buscar dispositivos cercanos.",
        "BLE_PERMISSION_DENIED",
      );
    }

    const ble = getNativeManager();
    if ((await ble.state()) !== "PoweredOn") {
      throw new PairingError(
        "Activa Bluetooth en los ajustes del teléfono y vuelve a intentar.",
        "BLE_UNAVAILABLE",
      );
    }
    if (activeScan) {
      throw new PairingError("Ya hay una búsqueda BLE activa.", "INVALID_STATE");
    }

    const duration = Math.min(Math.max(timeoutMs, 1_000), 30_000);
    return new Promise<NearbyShelly[]>((resolve, reject) => {
      const devices = new Map<string, NearbyShelly>();
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        resolve(
          [...devices.values()].sort(
            (left, right) => (right.rssi ?? -127) - (left.rssi ?? -127),
          ),
        );
      };
      const timer = setTimeout(() => {
        void stopActiveScan();
      }, duration);
      activeScan = { devices, finish, timer };

      void ble
        .startDeviceScan(null, { allowDuplicates: true }, (error, device) => {
          if (error) {
            if (settled) return;
            settled = true;
            void failActiveScan(reject, "Falló el escaneo BLE.");
            return;
          }
          if (!device) return;
          const name = device.name ?? device.localName ?? undefined;
          if (!name || !/^shelly/i.test(name)) return;
          devices.set(device.id, {
            id: device.id,
            name,
            rssi: device.rssi ?? undefined,
            connected: false,
          });
        })
        .catch(() => {
          if (settled) return;
          settled = true;
          void failActiveScan(reject, "No se pudo iniciar el escaneo BLE.");
        });
    });
  },
  async cancelDiscovery() {
    await stopActiveScan();
  },
  async connect() {
    throw new PairingError(
      "La conexión y el bonding siguen deshabilitados hasta completar la POC física.",
      "PAIRING_UNSUPPORTED",
    );
  },
  async disconnect() {},
};
