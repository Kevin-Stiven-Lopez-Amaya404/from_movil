export type DeviceCategory =
  | "Electrodomesticos"
  | "Iluminacion"
  | "Climatizacion"
  | "Seguridad";

export type DeviceConnectivityStatus =
  | "ONLINE"
  | "OFFLINE"
  | "UNKNOWN";

export type SmartDevice = {
  id: string;
  homeId: string;
  name: string;
  /** Model identified by the backend; Plus 1PM is never assumed. */
  modelName?: string;
  category: DeviceCategory;
  icon: string;
  power: number;
  energy: number;
  voltage: number;
  current: number;
  frequency: number;
  online: boolean;
  connectivityStatus?: DeviceConnectivityStatus;
  temperature?: number;
  state: "on" | "off";
  yesterday: number;
  critical?: boolean;
  lastSeenAt?: string | null;
  lastStateChange?: string;
};

/** A device is controllable only when connectivity has been explicitly confirmed. */
export function getDeviceConnectivityState(
  device: Pick<SmartDevice, "online" | "connectivityStatus">,
): DeviceConnectivityStatus {
  if (device.connectivityStatus === "OFFLINE") return "OFFLINE";
  if (device.connectivityStatus === "ONLINE" && device.online) return "ONLINE";
  return "UNKNOWN";
}

export function isDeviceConfirmedOnline(
  device: Pick<SmartDevice, "online" | "connectivityStatus">,
): boolean {
  return getDeviceConnectivityState(device) === "ONLINE";
}
