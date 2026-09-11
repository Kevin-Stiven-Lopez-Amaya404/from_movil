import {
    createContext,
    PropsWithChildren,
    useContext,
    useMemo,
    useState,
} from "react";

import { smartHomeService } from "@/lib/services/smart-home-service";

// Tipos base usados por pantallas y reportes.
export type DeviceCategory =
  | "Electrodomesticos"
  | "Iluminacion"
  | "Climatizacion"
  | "Seguridad";
export type ReportRange = "Diario" | "Semana" | "Mes" | "Rango";
export type AppLanguage = "es" | "en" | "pt";
export type ColorMode = "light" | "dark";
export type UserRole = "admin" | "miembro" | "invitado";

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
  power: number; // W (potencia instantánea)
  energy: number; // Wh (energía acumulada)
  voltage: number; // V
  current: number; // A
  frequency: number; // Hz
  online: boolean;
  temperature?: number; // °C
  state: "on" | "off"; // estado del relé
  yesterday: number; // Wh (consumo del día anterior)
  critical?: boolean;
  lastStateChange?: string;
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
  homeConsumptionGoals: Record<string, number>;
  homes: SmartHomePlace[];
  sessionEmail: string;
  sessionRole: UserRole;
  accessibleHomes: SmartHomePlace[];
  language: AppLanguage;
  reportData: Record<ReportRange, ReportPoint[]>;
  resolvedAlerts: string[];
  resolvedSmartAlerts: string[];
  sessionName: string;
  offlineMode: boolean;
  lastSync: string;
  deactivateAccount: () => void;
  addDeviceToHome: (homeId: string, name: string) => void;
  addHome: (name: string) => void;
  setActiveHomeId: (homeId: string) => void;
  setAccountActive: (active: boolean) => void;
  setColorMode: (mode: ColorMode) => void;
  setHomeConsumptionGoal: (homeId: string, targetWh: number) => void;
  setLanguage: (language: AppLanguage) => void;
  setSessionName: (name: string) => void;
  setSessionEmail: (email: string) => void;
  setSessionRole: (role: UserRole) => void;
  setOfflineMode: (enabled: boolean) => void;
  setHomeDeviceState: (id: string, state: "on" | "off") => void;
  setAllHomeDevicesState: (homeId: string, state: "on" | "off") => void;
  assignHomeAccess: (email: string, homeId: string, assigned: boolean) => void;
  toggleDevice: (id: string) => void;
  toggleHomeFavorite: (homeId: string) => void;
  setDeviceOnline: (id: string, online: boolean) => void;
  resolveDeviceAlert: (id: string) => void;
  resolveSmartDeviceAlert: (id: string) => void;
  refreshSync: () => void;
};

// Datos iniciales de prueba. En una version real vendrian de backend/base de datos.
const initialHomes: SmartHomePlace[] = [
  { id: "casa", name: "Casa", location: "Hogar principal", favorite: true },
  {
    id: "oficina",
    name: "Oficina",
    location: "Espacio de trabajo",
    favorite: false,
  },
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
    power: 780,
    energy: 780,
    voltage: 120,
    current: 6.5,
    frequency: 60,
    online: true,
    state: "on",
    yesterday: 720,
    critical: true,
  },
  {
    id: "server",
    homeId: "oficina",
    name: "Servidor domestico",
    category: "Electrodomesticos",
    room: "Estudio",
    icon: "server",
    power: 320,
    energy: 320,
    voltage: 120,
    current: 2.7,
    frequency: 60,
    online: true,
    state: "on",
    yesterday: 350,
  },
  {
    id: "tv",
    homeId: "casa",
    name: "TV",
    category: "Electrodomesticos",
    room: "Habitacion",
    icon: "television-classic",
    power: 150,
    energy: 150,
    voltage: 120,
    current: 1.25,
    frequency: 60,
    online: true,
    state: "on",
    yesterday: 150,
  },
  {
    id: "charger",
    homeId: "casa",
    name: "Cargador",
    category: "Electrodomesticos",
    room: "Dormitorio",
    icon: "power-plug-outline",
    power: 80,
    energy: 80,
    voltage: 120,
    current: 0.67,
    frequency: 60,
    online: true,
    state: "on",
    yesterday: 110,
  },
  {
    id: "lights",
    homeId: "casa",
    name: "Luces inteligentes",
    category: "Iluminacion",
    room: "Cocina",
    icon: "lightbulb-on-outline",
    power: 110,
    energy: 110,
    voltage: 120,
    current: 0.92,
    frequency: 60,
    online: true,
    state: "on",
    yesterday: 180,
  },
  {
    id: "camera",
    homeId: "casa",
    name: "Camara principal",
    category: "Seguridad",
    room: "Entrada",
    icon: "cctv",
    power: 60,
    energy: 60,
    voltage: 120,
    current: 0.5,
    frequency: 60,
    online: true,
    state: "on",
    yesterday: 50,
  },
  {
    id: "stiven-relay",
    homeId: "casa",
    name: "Stiven",
    category: "Electrodomesticos",
    room: "Stiven",
    icon: "hardware-chip-outline",
    power: 0,
    energy: 0,
    voltage: 120,
    current: 0,
    frequency: 60,
    online: false,
    state: "off",
    yesterday: 0,
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
    { label: "T1", value: 126 },
    { label: "T2", value: 114 },
    { label: "T3", value: 98 },
    { label: "T4", value: 121 },
  ],
};

const defaultActiveDevices: ActiveDevice[] = [
  {
    id: "phone",
    name: "Movil (este dispositivo)",
    lastAccess: "ahora",
    verified: true,
  },
  {
    id: "tablet-ana",
    name: "Tablet de Ana",
    lastAccess: "ayer, 18:27",
    verified: true,
  },
  {
    id: "tablet-guest",
    name: "Tablet invitados",
    lastAccess: "hace 3 dias",
    verified: false,
  },
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
  // Metas demo locales por hogar. Podrán sustituirse por datos del backend cuando exista contrato.
  const [homeConsumptionGoals, setHomeConsumptionGoals] = useState<
    Record<string, number>
  >({
    casa: 5000,
    oficina: 3000,
  });
  const [activeDevices, setActiveDevices] = useState(defaultActiveDevices);
  const [accountActive, setAccountActive] = useState(true);
  const [colorMode, setColorMode] = useState<ColorMode>("light");
  const [language, setLanguage] = useState<AppLanguage>("es");
  const [offlineMode, setOfflineMode] = useState(false);
  const [sessionName, setSessionName] = useState("Pepe");
  const [sessionEmail, setSessionEmail] = useState("pepe@smarthome.com");
  const [sessionRole, setSessionRole] = useState<UserRole>("miembro");
  const [lastSync, setLastSync] = useState(getTimeStamp());

  // Alertas Smart Home ya resueltas por el usuario.
  // Se mantiene separado de activeDevices porque ese estado pertenece
  // a la seguridad/sesiones de la cuenta.
  const [resolvedSmartAlerts, setResolvedSmartAlerts] = useState<string[]>([]);

  // Asignaciones demo: el administrador decide qué hogar puede ver cada cuenta.
  // En producción estas relaciones deben venir del backend/BD.
  const [homeAccess, setHomeAccess] = useState<Record<string, string[]>>({
    "admin@smarthome.com": ["casa", "oficina"],
    "pepe@smarthome.com": ["casa"],
    "miembro@smarthome.com": ["casa"],
    "invitado@smarthome.com": ["casa"],
  });

  const accessibleHomeIds =
    sessionRole === "admin"
      ? homes.map((home) => home.id)
      : (homeAccess[sessionEmail] ?? []);
  const accessibleHomes = homes.filter((home) =>
    accessibleHomeIds.includes(home.id),
  );

  // `useMemo` evita reconstruir el objeto de contexto si sus dependencias no cambian.
  const value = useMemo<SmartHomeState>(
    () => ({
      activeHomeId,
      activeDevices,
      accountActive,
      colorMode,
      devices,
      homeConsumptionGoals,
      homes,
      sessionEmail,
      sessionRole,
      accessibleHomes,
      language,
      lastSync,
      offlineMode,
      reportData,
      resolvedAlerts: activeDevices
        .filter((item) => item.verified)
        .map((item) => item.id),
      resolvedSmartAlerts,
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
            power: 0,
            energy: 0,
            voltage: 120,
            current: 0,
            frequency: 60,
            online: true,
            state: "off",
            yesterday: 0,
          },
        ]);

        smartHomeService
          .createDevice({
            homeId,
            name: cleanName,
            category: "Electrodomesticos",
            room: "General",
          })
          .catch(() => null);
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
        setHomeConsumptionGoals((items) => ({ ...items, [id]: 5000 }));
        setActiveHomeId(id);

        smartHomeService
          .createHome({
            name: cleanName,
            location: "Nuevo hogar",
          })
          .catch(() => null);
      },
      setActiveHomeId,
      setAccountActive,
      setColorMode,
      setHomeConsumptionGoal: (homeId, targetWh) => {
        if (!Number.isFinite(targetWh) || targetWh <= 0) return;
        setHomeConsumptionGoals((items) => ({ ...items, [homeId]: targetWh }));
      },
      setLanguage,
      setSessionName,
      setSessionEmail,
      setSessionRole,
      setOfflineMode,
      // Cambia el estado online/offline de un dispositivo.
      toggleDevice: (id) => {
        const timestamp = getTimeStamp();
        setDevices((items) => {
          const next: SmartDevice[] = items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  state: (item.state === "on" ? "off" : "on") as "on" | "off",
                  lastStateChange: timestamp,
                }
              : item,
          );
          const updatedItem = next.find((item) => item.id === id);
          if (updatedItem) {
            smartHomeService
              .updateDeviceState(id, updatedItem.state)
              .catch(() => null);
          }
          return next;
        });
      },
      // Marca o desmarca un hogar como favorito para el dashboard.
      toggleHomeFavorite: (homeId) => {
        setHomes((items) => {
          const target = items.find((item) => item.id === homeId);
          if (target) {
            smartHomeService
              .toggleHomeFavorite(homeId, !target.favorite)
              .catch(() => null);
          }
          return items.map((item) =>
            item.id === homeId ? { ...item, favorite: !item.favorite } : item,
          );
        });
      },
      // Fuerza un estado especifico para un dispositivo.
      setDeviceOnline: (id, online) => {
        setDevices((items) =>
          items.map((item) => (item.id === id ? { ...item, online } : item)),
        );
        smartHomeService.updateDeviceStatus(id, { online }).catch(() => null);

        // Un cambio manual de estado inicia un nuevo ciclo de evaluación
        // para ese dispositivo.
        setResolvedSmartAlerts((alerts) =>
          alerts.filter((alertId) => alertId !== id),
        );
      },
      setHomeDeviceState: (id, state) => {
        setDevices((items) =>
          items.map((item) =>
            item.id === id
              ? { ...item, state, lastStateChange: getTimeStamp() }
              : item,
          ),
        );
        smartHomeService.updateDeviceState(id, state).catch(() => null);
      },
      setAllHomeDevicesState: (homeId, state) => {
        setDevices((items) =>
          items.map((item) =>
            item.homeId === homeId
              ? { ...item, state, lastStateChange: getTimeStamp() }
              : item,
          ),
        );
        smartHomeService
          .setAllHomeDevicesState(homeId, state)
          .catch(() => null);
      },
      assignHomeAccess: (email, homeId, assigned) => {
        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail) return;
        setHomeAccess((items) => {
          const current = items[cleanEmail] ?? [];
          const next = assigned
            ? Array.from(new Set([...current, homeId]))
            : current.filter((id) => id !== homeId);
          return { ...items, [cleanEmail]: next };
        });
      },
      // Marca una alerta/dispositivo activo como verificado.
      resolveDeviceAlert: (id) => {
        setActiveDevices((items) =>
          items.map((item) =>
            item.id === id ? { ...item, verified: true } : item,
          ),
        );
      },

      // Resuelve una alerta de un dispositivo Smart Home.
      // La alerta queda registrada por su id para que la pantalla
      // de alertas pueda ocultarla sin modificar el dispositivo.
      resolveSmartDeviceAlert: (id) => {
        setResolvedSmartAlerts((items) =>
          items.includes(id) ? items : [...items, id],
        );
      },

      refreshSync: () => setLastSync(getTimeStamp()),
    }),
    [
      accountActive,
      activeDevices,
      activeHomeId,
      colorMode,
      devices,
      homeConsumptionGoals,
      homes,
      sessionEmail,
      sessionRole,
      accessibleHomes,
      language,
      lastSync,
      offlineMode,
      resolvedSmartAlerts,
      sessionName,
    ],
  );

  return (
    <SmartHomeContext.Provider value={value}>
      {children}
    </SmartHomeContext.Provider>
  );
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
