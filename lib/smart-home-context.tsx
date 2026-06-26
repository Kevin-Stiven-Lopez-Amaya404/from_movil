import { createContext, PropsWithChildren, useContext, useMemo, useState } from "react";

export type HomeArea = "Casa" | "Oficina";
export type DeviceCategory = "Electrodomesticos" | "Iluminacion" | "Climatizacion" | "Seguridad";
export type ReportRange = "Diario" | "Semana" | "Mes" | "Rango";
export type AppLanguage = "es" | "en" | "pt";
export type ColorMode = "light" | "dark";

export type SmartDevice = {
  id: string;
  name: string;
  category: DeviceCategory;
  room: string;
  icon: string;
  consumption: number;
  yesterday: number;
  online: boolean;
  critical?: boolean;
};

type ActiveDevice = {
  id: string;
  name: string;
  lastAccess: string;
  verified: boolean;
};

type ReportPoint = {
  label: string;
  value: number;
};

type SmartHomeState = {
  activeHome: HomeArea;
  activeDevices: ActiveDevice[];
  accountActive: boolean;
  colorMode: ColorMode;
  devices: SmartDevice[];
  language: AppLanguage;
  reportData: Record<ReportRange, ReportPoint[]>;
  resolvedAlerts: string[];
  sessionName: string;
  offlineMode: boolean;
  lastSync: string;
  deactivateAccount: () => void;
  setActiveHome: (home: HomeArea) => void;
  setAccountActive: (active: boolean) => void;
  setColorMode: (mode: ColorMode) => void;
  setLanguage: (language: AppLanguage) => void;
  setSessionName: (name: string) => void;
  setOfflineMode: (enabled: boolean) => void;
  toggleDevice: (id: string) => void;
  setDeviceOnline: (id: string, online: boolean) => void;
  resolveDeviceAlert: (id: string) => void;
  refreshSync: () => void;
};

const initialDevices: SmartDevice[] = [
  {
    id: "ac",
    name: "Aire acondicionado",
    category: "Climatizacion",
    room: "Sala",
    icon: "air-conditioner",
    consumption: 0.78,
    yesterday: 0.72,
    online: true,
    critical: true,
  },
  {
    id: "server",
    name: "Servidor domestico",
    category: "Electrodomesticos",
    room: "Estudio",
    icon: "server",
    consumption: 0.32,
    yesterday: 0.35,
    online: true,
  },
  {
    id: "tv",
    name: "TV",
    category: "Electrodomesticos",
    room: "Habitacion",
    icon: "television-classic",
    consumption: 0.15,
    yesterday: 0.15,
    online: true,
  },
  {
    id: "charger",
    name: "Cargador",
    category: "Electrodomesticos",
    room: "Dormitorio",
    icon: "power-plug-outline",
    consumption: 0.08,
    yesterday: 0.11,
    online: true,
  },
  {
    id: "lights",
    name: "Luces inteligentes",
    category: "Iluminacion",
    room: "Cocina",
    icon: "lightbulb-on-outline",
    consumption: 0.11,
    yesterday: 0.18,
    online: true,
  },
  {
    id: "camera",
    name: "Camara principal",
    category: "Seguridad",
    room: "Entrada",
    icon: "cctv",
    consumption: 0.06,
    yesterday: 0.05,
    online: true,
  },
];

const reportData: Record<ReportRange, ReportPoint[]> = {
  Diario: [
    { label: "06", value: 2 },
    { label: "09", value: 4 },
    { label: "12", value: 6 },
    { label: "15", value: 5 },
    { label: "18", value: 8 },
    { label: "21", value: 3 },
  ],
  Semana: [
    { label: "Lun", value: 8 },
    { label: "Mar", value: 10 },
    { label: "Mie", value: 18 },
    { label: "Jue", value: 13 },
    { label: "Vie", value: 2 },
    { label: "Sab", value: 9 },
    { label: "Dom", value: 6 },
  ],
  Mes: [
    { label: "S1", value: 34 },
    { label: "S2", value: 41 },
    { label: "S3", value: 29 },
    { label: "S4", value: 37 },
  ],
  Rango: [
    { label: "Abr", value: 126 },
    { label: "May", value: 114 },
    { label: "Jun", value: 98 },
  ],
};

const defaultActiveDevices: ActiveDevice[] = [
  { id: "phone", name: "Movil (este dispositivo)", lastAccess: "ahora", verified: true },
  { id: "tablet-ana", name: "Tablet de Ana", lastAccess: "ayer, 18:27", verified: true },
  { id: "tablet-guest", name: "Tablet invitados", lastAccess: "hace 3 dias", verified: false },
];

const SmartHomeContext = createContext<SmartHomeState | null>(null);

function getTimeStamp() {
  return new Intl.DateTimeFormat("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

export function SmartHomeProvider({ children }: PropsWithChildren) {
  const [activeHome, setActiveHome] = useState<HomeArea>("Casa");
  const [devices, setDevices] = useState(initialDevices);
  const [activeDevices, setActiveDevices] = useState(defaultActiveDevices);
  const [accountActive, setAccountActive] = useState(true);
  const [colorMode, setColorMode] = useState<ColorMode>("light");
  const [language, setLanguage] = useState<AppLanguage>("es");
  const [offlineMode, setOfflineMode] = useState(false);
  const [sessionName, setSessionName] = useState("Pepe");
  const [lastSync, setLastSync] = useState(getTimeStamp());

  const value = useMemo<SmartHomeState>(
    () => ({
      activeHome,
      activeDevices,
      accountActive,
      colorMode,
      devices,
      language,
      lastSync,
      offlineMode,
      reportData,
      resolvedAlerts: activeDevices.filter((item) => item.verified).map((item) => item.id),
      sessionName,
      deactivateAccount: () => {
        setAccountActive(false);
        setOfflineMode(false);
      },
      setActiveHome,
      setAccountActive,
      setColorMode,
      setLanguage,
      setSessionName,
      setOfflineMode,
      toggleDevice: (id) => {
        setDevices((items) =>
          items.map((item) =>
            item.id === id ? { ...item, online: !item.online } : item,
          ),
        );
      },
      setDeviceOnline: (id, online) => {
        setDevices((items) =>
          items.map((item) => (item.id === id ? { ...item, online } : item)),
        );
      },
      resolveDeviceAlert: (id) => {
        setActiveDevices((items) =>
          items.map((item) => (item.id === id ? { ...item, verified: true } : item)),
        );
      },
      refreshSync: () => setLastSync(getTimeStamp()),
    }),
    [accountActive, activeDevices, activeHome, colorMode, devices, language, lastSync, offlineMode, sessionName],
  );

  return <SmartHomeContext.Provider value={value}>{children}</SmartHomeContext.Provider>;
}

export function useSmartHome() {
  const context = useContext(SmartHomeContext);

  if (!context) {
    throw new Error("useSmartHome must be used within SmartHomeProvider");
  }

  return context;
}
