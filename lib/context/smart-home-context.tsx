import { createContext, PropsWithChildren, useContext, useMemo, useState } from "react";

// Tipos base usados por pantallas y reportes.
export type DeviceCategory = "Electrodomesticos" | "Iluminacion" | "Climatizacion" | "Seguridad";
export type ReportRange = "Diario" | "Semana" | "Mes" | "Rango";
export type AppLanguage = "es" | "en" | "pt";
export type ColorMode = "light" | "dark";

/**
 * Representa un hogar registrado.
 *
 * `favorite` permite que el dashboard decida que hogares mostrar como acceso rapido.
 */
export type SmartHomePlace = {
  id: string;
  name: string;
  location: string;
  favorite: boolean;
};

/**
 * Representa un dispositivo inteligente.
 *
 * La relacion clave es `homeId`: cada dispositivo pertenece a un hogar.
 */
export type SmartDevice = {
  id: string;
  homeId: string;
  name: string;
  category: DeviceCategory;
  room: string;
  icon: string;
  // Nuevos campos del Shelly
  power: number;          // W (potencia instantánea)
  energy: number;         // Wh (energía acumulada)
  voltage: number;        // V
  current: number;        // A
  frequency: number;      // Hz
  online: boolean;
  temperature?: number;   // °C
  state: "on" | "off";    // estado del relé
  yesterday: number;      // Wh (consumo del día anterior)
  critical?: boolean;
};

// Dispositivos activos usados para auditoria/perfil.
type ActiveDevice = {
  id: string;
  name: string;
  lastAccess: string;
  verified: boolean;
};

// Punto simple para graficas de reportes.
type ReportPoint = {
  label: string;
  value: number;
};

/**
 * Contrato completo del contexto global.
 *
 * Incluye datos y acciones que consumen varias pantallas. Esto evita pasar props
 * manualmente entre Dashboard, Hogares, Reportes, Perfil y Configuracion.
 */
type SmartHomeState = {
  activeHomeId: string;
  activeDevices: ActiveDevice[];
  accountActive: boolean;
  colorMode: ColorMode;
  devices: SmartDevice[];
  homes: SmartHomePlace[];
  language: AppLanguage;
  reportData: Record<ReportRange, ReportPoint[]>;
  resolvedAlerts: string[];
  sessionName: string;
  offlineMode: boolean;
  lastSync: string;
  deactivateAccount: () => void;
  addDeviceToHome: (homeId: string, name: string) => void;
  addHome: (name: string) => void;
  setActiveHomeId: (homeId: string) => void;
  setAccountActive: (active: boolean) => void;
  setColorMode: (mode: ColorMode) => void;
  setLanguage: (language: AppLanguage) => void;
  setSessionName: (name: string) => void;
  setOfflineMode: (enabled: boolean) => void;
  toggleDevice: (id: string) => void;
  toggleHomeFavorite: (homeId: string) => void;
  setDeviceOnline: (id: string, online: boolean) => void;
  resolveDeviceAlert: (id: string) => void;
  refreshSync: () => void;
};

// Datos iniciales de prueba. En una version real vendrian de backend/base de datos.
const initialHomes: SmartHomePlace[] = [
  { id: "casa", name: "Casa", location: "Hogar principal", favorite: true },
  { id: "oficina", name: "Oficina", location: "Espacio de trabajo", favorite: false },
];

// Dispositivos iniciales asociados a hogares mediante `homeId`.
const initialDevices: SmartDevice[] = [
  {
    id: "ac",
    homeId: "casa",
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
    homeId: "oficina",
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
    homeId: "casa",
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
    homeId: "casa",
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
    homeId: "casa",
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
    homeId: "casa",
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

/**
 * Genera una hora corta para mostrar ultima sincronizacion local.
 */
function getTimeStamp() {
  return new Intl.DateTimeFormat("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

/**
 * Crea identificadores legibles a partir de nombres ingresados por el usuario.
 *
 * Quita tildes/caracteres especiales y agrega timestamp para reducir choques.
 */
function createId(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `${slug || "hogar"}-${Date.now()}`;
}

/**
 * Proveedor global de Smart Home.
 *
 * Aqui vive la "fuente de verdad" de la app mientras no hay backend:
 * hogares, dispositivos, tema, idioma, sesion y acciones de modificacion.
 */
export function SmartHomeProvider({ children }: PropsWithChildren) {
  // Estados principales compartidos entre pantallas.
  const [homes, setHomes] = useState(initialHomes);
  const [activeHomeId, setActiveHomeId] = useState(initialHomes[0].id);
  const [devices, setDevices] = useState(initialDevices);
  const [activeDevices, setActiveDevices] = useState(defaultActiveDevices);
  const [accountActive, setAccountActive] = useState(true);
  const [colorMode, setColorMode] = useState<ColorMode>("light");
  const [language, setLanguage] = useState<AppLanguage>("es");
  const [offlineMode, setOfflineMode] = useState(false);
  const [sessionName, setSessionName] = useState("Pepe");
  const [lastSync, setLastSync] = useState(getTimeStamp());

  // `useMemo` evita reconstruir el objeto de contexto si sus dependencias no cambian.
  const value = useMemo<SmartHomeState>(
    () => ({
      activeHomeId,
      activeDevices,
      accountActive,
      colorMode,
      devices,
      homes,
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
      // Crea un dispositivo nuevo dentro de un hogar especifico.
      addDeviceToHome: (homeId, name) => {
        const cleanName = name.trim();
        if (!cleanName) return;

        setDevices((items) => [
          ...items,
          {
            id: createId(cleanName),
            homeId,
            name: cleanName,
            category: "Electrodomesticos",
            room: "General",
            icon: "power-plug-outline",
            consumption: 0,
            yesterday: 0,
            online: true,
          },
        ]);
      },
      // Crea un hogar y lo marca como activo para que el usuario pueda administrarlo.
      addHome: (name) => {
        const cleanName = name.trim();
        if (!cleanName) return;

        const id = createId(cleanName);
        setHomes((items) => [
          ...items,
          {
            id,
            name: cleanName,
            location: "Nuevo hogar",
            favorite: items.length === 0,
          },
        ]);
        setActiveHomeId(id);
      },
      setActiveHomeId,
      setAccountActive,
      setColorMode,
      setLanguage,
      setSessionName,
      setOfflineMode,
      // Cambia el estado online/offline de un dispositivo.
      toggleDevice: (id) => {
        setDevices((items) =>
          items.map((item) =>
            item.id === id ? { ...item, online: !item.online } : item,
          ),
        );
      },
      // Marca o desmarca un hogar como favorito para el dashboard.
      toggleHomeFavorite: (homeId) => {
        setHomes((items) =>
          items.map((item) =>
            item.id === homeId ? { ...item, favorite: !item.favorite } : item,
          ),
        );
      },
      // Fuerza un estado especifico para un dispositivo.
      setDeviceOnline: (id, online) => {
        setDevices((items) =>
          items.map((item) => (item.id === id ? { ...item, online } : item)),
        );
      },
      // Marca una alerta/dispositivo activo como verificado.
      resolveDeviceAlert: (id) => {
        setActiveDevices((items) =>
          items.map((item) => (item.id === id ? { ...item, verified: true } : item)),
        );
      },
      refreshSync: () => setLastSync(getTimeStamp()),
    }),
    [accountActive, activeDevices, activeHomeId, colorMode, devices, homes, language, lastSync, offlineMode, sessionName],
  );

  return <SmartHomeContext.Provider value={value}>{children}</SmartHomeContext.Provider>;
}

/**
 * Hook seguro para consumir el contexto.
 *
 * Lanza error si se usa fuera de `SmartHomeProvider`, lo que ayuda a detectar
 * configuraciones incorrectas durante desarrollo.
 */
export function useSmartHome() {
  const context = useContext(SmartHomeContext);

  if (!context) {
    throw new Error("useSmartHome must be used within SmartHomeProvider");
  }

  return context;
}
