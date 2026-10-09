import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { useMockApi } from "@/lib/config/api-config";
import type { SmartDevice } from "@/lib/domain/device";
import type {
  AppLanguage,
  ColorMode,
} from "@/lib/domain/preferences";
import type {
  ReportPoint,
  ReportRange,
} from "@/lib/domain/report";
import type {
  UserRole,
} from "@/lib/domain/session";
import type {
  HomeInvitation,
  HomeMember,
  HomeRole,
  SmartHomePlace,
} from "@/lib/domain/home";
import { authService } from "@/lib/services/auth-service";
import type { SmartNotification } from "@/lib/services/notifications-service";
import { smartHomeService } from "@/lib/services/smart-home-service";
import { clearSession } from "@/lib/session/session-store";
import { useSessionLifecycle } from "@/lib/hooks/use-session-lifecycle";
import { useHomeDataLoader } from "@/lib/hooks/use-home-data-loader";
import { useDeviceActions } from "@/lib/hooks/use-device-actions";
import { useNotificationActions } from "@/lib/hooks/use-notification-actions";
import { useNotificationSync } from "@/lib/hooks/use-notification-sync";
import { useRealtimeSync } from "@/lib/hooks/use-realtime-sync";

export type {
  AppLanguage,
  ColorMode,
  HomeInvitation,
  HomeMember,
  HomeRole,
  ReportPoint,
  ReportRange,
  SmartDevice,
  SmartHomePlace,
  UserRole,
};

/**
 * Contrato completo del contexto global.
 *
 * Incluye datos y acciones que consumen varias pantallas. Esto evita pasar props
 * manualmente entre Dashboard, Hogares, Reportes, Perfil y Configuracion.
 */
type SmartHomeState = {
  activeHomeId: string;
  accountActive: boolean;
  colorMode: ColorMode;
  devices: SmartDevice[];
  notifications: SmartNotification[];
  unreadNotificationCount: number;
  homeConsumptionGoals: Record<string, number>;
  homes: SmartHomePlace[];
  homeMembersByHome: Record<string, HomeMember[]>;
  incomingInvitations: HomeInvitation[];
  sessionEmail: string;
  sessionRole: UserRole;
  accessibleHomes: SmartHomePlace[];
  language: AppLanguage;
  reportData: Record<ReportRange, ReportPoint[]>;
  resolvedSmartAlerts: string[];
  sessionName: string;
  offlineMode: boolean;
  lastSync: string;
  deactivateAccount: () => Promise<void>;
  removeDevice: (deviceId: string) => Promise<void>;
  updateDevice: (deviceId: string, updates: { name?: string }) => Promise<void>;
  addHome: (name: string) => Promise<void>;
  setActiveHomeId: (homeId: string) => void;
  setAccountActive: (active: boolean) => void;
  setColorMode: (mode: ColorMode) => void;
  setHomeConsumptionGoal: (homeId: string, targetWh: number) => void;
  setLanguage: (language: AppLanguage) => void;
  setSessionName: (name: string) => void;
  setSessionEmail: (email: string) => void;
  setSessionRole: (role: UserRole) => void;
  setOfflineMode: (enabled: boolean) => void;
  setHomeDeviceState: (id: string, state: "on" | "off") => Promise<void>;
  inviteHomeMember: (
    homeId: string,
    email: string,
    role: Exclude<HomeRole, "OWNER">,
  ) => Promise<void>;
  acceptInvitation: (invitationId: string) => Promise<void>;
  rejectInvitation: (invitationId: string) => Promise<void>;
  updateHomeMemberRole: (
    homeId: string,
    memberId: string,
    role: HomeRole,
  ) => Promise<void>;
  revokeHomeMember: (homeId: string, memberId: string) => Promise<void>;
  leaveHome: (homeId: string) => Promise<void>;
  toggleDevice: (id: string) => Promise<void>;
  toggleHomeFavorite: (homeId: string) => void;
  setDeviceOnline: (id: string, online: boolean) => void;
  resolveSmartDeviceAlert: (id: string) => void;
  refreshSync: () => void;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  dismissNotification: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
};

// Datos iniciales de prueba. En una version real vendrian de backend/base de datos.
const initialHomes: SmartHomePlace[] = [
  {
    id: "casa",
    name: "Casa",
    location: "Hogar principal",
    favorite: true,
    homeRole: "OWNER",
  },
  {
    id: "oficina",
    name: "Oficina",
    location: "Espacio de trabajo",
    favorite: false,
    homeRole: "OWNER",
  },
];

// Dispositivos iniciales asociados a hogares mediante `homeId`.
const initialDevices: SmartDevice[] = [
  {
    id: "ac",
    homeId: "casa",
    name: "Aire acondicionado",
    category: "Climatizacion",
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
  const [homes, setHomes] = useState(() => (useMockApi ? initialHomes : []));
  const [homeMembersByHome, setHomeMembersByHome] = useState<
    Record<string, HomeMember[]>
  >({});
  const [incomingInvitations, setIncomingInvitations] = useState<HomeInvitation[]>([]);
  const [activeHomeId, setActiveHomeId] = useState(
    useMockApi ? initialHomes[0].id : "",
  );
  const [devices, setDevices] = useState(() =>
    useMockApi ? initialDevices : [],
  );
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  // Metas demo locales por hogar. Podrán sustituirse por datos del backend cuando exista contrato.
  const [homeConsumptionGoals, setHomeConsumptionGoals] = useState<
    Record<string, number>
  >({
    casa: 5000,
    oficina: 3000,
  });
  const [accountActive, setAccountActive] = useState(true);
  const [colorMode, setColorMode] = useState<ColorMode>("light");
  const [language, setLanguage] = useState<AppLanguage>("es");
  const [offlineMode, setOfflineMode] = useState(false);

  const [lastSync, setLastSync] = useState(getTimeStamp());
  const resetDemoSession = useCallback(() => {
    setHomes(initialHomes);
    setHomeMembersByHome({});
    setDevices(initialDevices);
    setActiveHomeId(initialHomes[0].id);
    setNotifications([]);
    setUnreadNotificationCount(0);
    setOfflineMode(false);
  }, []);

  const {
    sessionName,
    sessionEmail,
    sessionRole,
    sessionRevision,
    setSessionName,
    setSessionEmail,
    setSessionRole,
  } = useSessionLifecycle({
    onDemoSession: resetDemoSession,
  });

  useHomeDataLoader({
    sessionRevision,
    setHomes,
    setHomeMembersByHome,
    setIncomingInvitations,
    setActiveHomeId,
    setDevices,
    setSessionRole,
    setOfflineMode,
  });

  // Alertas Smart Home ya resueltas por el usuario.
  const [resolvedSmartAlerts, setResolvedSmartAlerts] = useState<string[]>([]);

  const accessibleHomes = homes;

  const {
    removeDevice,
    updateDevice,
    setHomeDeviceState,
    toggleDevice,
  } = useDeviceActions({
    devices,
    homes,
    setDevices,
    getTimeStamp,
  });

  useNotificationSync({
    sessionRevision,
    setNotifications,
    setUnreadNotificationCount,
    setOfflineMode,
  });

  useRealtimeSync({
    sessionRevision,
    setDevices,
    setNotifications,
    setUnreadNotificationCount,
    setOfflineMode,
    setLastSync,
    getTimeStamp,
  });

  const {
    markNotificationAsRead,
    dismissNotification,
    markAllNotificationsAsRead,
  } = useNotificationActions({
    notifications,
    setNotifications,
    setUnreadNotificationCount,
  });

  // `useMemo` evita reconstruir el objeto de contexto si sus dependencias no cambian.
  const value = useMemo<SmartHomeState>(
    () => ({
      activeHomeId,
      accountActive,
      colorMode,
      devices,
      homeConsumptionGoals,
      homes,
      homeMembersByHome,
      incomingInvitations,
      notifications,
      unreadNotificationCount,
      sessionEmail,
      sessionRole,
      accessibleHomes,
      language,
      lastSync,
      offlineMode,
      reportData,
      resolvedSmartAlerts,
      sessionName,
      deactivateAccount: async () => {
        await authService.deactivateAccount();
        setAccountActive(false);
        setOfflineMode(false);
        await clearSession();
      },
      removeDevice,
      updateDevice,
      // Crea un hogar y lo marca como activo para que el usuario pueda administrarlo.
      addHome: async (name) => {
        const cleanName = name.trim();
        if (!cleanName) return;

        try {
          const created = await smartHomeService.createHome({
            name: cleanName,
            location: "Nuevo hogar",
          });

          const nextHome = {
            ...created,
            location: created.location ?? "Nuevo hogar",
            favorite: created.favorite ?? false,
          };

          setHomes((items) => {
            const exists = items.some((item) => item.id === nextHome.id);
            return exists ? items : [...items, nextHome];
          });
          setHomeConsumptionGoals((items) => ({
            ...items,
            [nextHome.id]: items[nextHome.id] ?? 5000,
          }));
          setActiveHomeId(nextHome.id);
        } catch {
          const fallbackId = createId(cleanName);
          setHomes((items) => [
            ...items,
            {
              id: fallbackId,
              name: cleanName,
              location: "Nuevo hogar",
              favorite: items.length === 0,
            },
          ]);
          setHomeConsumptionGoals((items) => ({ ...items, [fallbackId]: 5000 }));
          setActiveHomeId(fallbackId);
        }
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
      toggleDevice,
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
        // Un cambio manual de estado inicia un nuevo ciclo de evaluación
        // para ese dispositivo.
        setResolvedSmartAlerts((alerts) =>
          alerts.filter((alertId) => alertId !== id),
        );
      },
      setHomeDeviceState,
      inviteHomeMember: async (homeId, email, role) => {
        const member = await smartHomeService.inviteHomeMember(
          homeId,
          email,
          role,
        );
        setHomeMembersByHome((membersByHome) => ({
          ...membersByHome,
          [homeId]: [
            member,
            ...(membersByHome[homeId] ?? []).filter(
              (existing) => existing.id !== member.id,
            ),
          ],
        }));
      },
      acceptInvitation: async (invitationId) => {
        await smartHomeService.acceptInvitation(invitationId);
        setIncomingInvitations((items) =>
          items.filter((item) => item.id !== invitationId),
        );
      },
      rejectInvitation: async (invitationId) => {
        await smartHomeService.rejectInvitation(invitationId);
        setIncomingInvitations((items) =>
          items.filter((item) => item.id !== invitationId),
        );
      },
      updateHomeMemberRole: async (homeId, memberId, role) => {
        const updated = await smartHomeService.updateMemberRole(
          homeId,
          memberId,
          role,
        );
        setHomeMembersByHome((membersByHome) => ({
          ...membersByHome,
          [homeId]: (membersByHome[homeId] ?? []).map((member) =>
            member.id === memberId ? updated : member,
          ),
        }));
      },
      revokeHomeMember: async (homeId, memberId) => {
        const revoked = await smartHomeService.revokeMember(homeId, memberId);
        setHomeMembersByHome((membersByHome) => ({
          ...membersByHome,
          [homeId]: (membersByHome[homeId] ?? []).map((member) =>
            member.id === memberId ? revoked : member,
          ),
        }));
      },
      leaveHome: async (homeId) => {
        await smartHomeService.leaveHome(homeId);
        setHomes((items) => {
          const remaining = items.filter((home) => home.id !== homeId);
          setActiveHomeId((current) =>
            current === homeId ? remaining[0]?.id ?? "" : current,
          );
          return remaining;
        });
        setHomeMembersByHome((membersByHome) => ({
          ...membersByHome,
          [homeId]: [],
        }));
      },
      // Resuelve una alerta de un dispositivo Smart Home.
      // La alerta queda registrada por su id para que la pantalla
      // de alertas pueda ocultarla sin modificar el dispositivo.
      resolveSmartDeviceAlert: (id) => {
        setResolvedSmartAlerts((items) =>
          items.includes(id) ? items : [...items, id],
        );
      },

      markNotificationAsRead,
      dismissNotification,
      markAllNotificationsAsRead,

      refreshSync: () => setLastSync(getTimeStamp()),
    }),
    [
      accountActive,
      activeHomeId,
      colorMode,
      devices,
      homeConsumptionGoals,
      homes,
      homeMembersByHome,
      incomingInvitations,
      notifications,
      dismissNotification,
      markAllNotificationsAsRead,
      markNotificationAsRead,
      removeDevice,
      sessionEmail,
      sessionRole,
      setSessionEmail,
      setSessionName,
      setSessionRole,
      setHomeDeviceState,
      accessibleHomes,
      language,
      lastSync,
      offlineMode,
      resolvedSmartAlerts,
      sessionName,
      toggleDevice,
      unreadNotificationCount,
      updateDevice,
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
