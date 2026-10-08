export type DeviceCategory =
  | "Electrodomesticos"
  | "Iluminacion"
  | "Climatizacion"
  | "Seguridad";

export type SmartDevice = {
  id: string;
  homeId: string;
  name: string;
  category: DeviceCategory;
  icon: string;
  power: number;
  energy: number;
  voltage: number;
  current: number;
  frequency: number;
  online: boolean;
  temperature?: number;
  state: "on" | "off";
  yesterday: number;
  critical?: boolean;
  lastSeenAt?: string | null;
  lastStateChange?: string;
};