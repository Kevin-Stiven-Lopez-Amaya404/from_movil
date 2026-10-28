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
  /** Modelo identificado por el backend; nunca se supone Plus 1PM. */
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
