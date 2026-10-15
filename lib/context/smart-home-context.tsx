import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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
import {
  clearSession,
  loadSession,
  subscribeToSessionChanges,
} from "@/lib/session/session-store";
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
type DataLoadStatus = "loading" | "loaded" | "error";

type SmartHomeState = {
  activeHomeId: string;
  accountActive: boolean;
  colorMode: ColorMode;
  devices: SmartDevice[];
  notifications: SmartNotification[];
  unreadNotificationCount: number;
  homeConsumptionGoals: Record<string, number>;
  homes: SmartHomePlace[];
  homesLoadStatus: DataLoadStatus;
  deviceLoadStatusByHome: Record<string, DataLoadStatus>;
  homeMembersByHome: Record<string, HomeMember[]>;
  incomingInvitations: HomeInvitation[];
  sessionEmail: string;
  sessionRole: UserRole;
  accessibleHomes: SmartHomePlace[];
  language: AppLanguage;
  resolvedSmartAlerts: string[];
  sessionName: string;
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
 * Proveedor global de Smart Home.
 *
 * Aqui vive la "fuente de verdad" de la app mientras no hay backend:
 * hogares, dispositivos, tema, idioma, sesion y acciones de modificacion.
 */
export function SmartHomeProvider({ children }: PropsWithChildren) {
  // Estados principales compartidos entre pantallas.
  const [homes, setHomes] = useState<SmartHomePlace[]>([]);
  const [homeMembersByHome, setHomeMembersByHome] = useState<
    Record<string, HomeMember[]>
  >({});
  const [incomingInvitations, setIncomingInvitations] = useState<HomeInvitation[]>([]);
  const [activeHomeId, setActiveHomeId] = useState("");
  const [devices, setDevices] = useState<SmartDevice[]>([]);
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [homeConsumptionGoals, setHomeConsumptionGoals] = useState<
    Record<string, number>
  >({});
  const [accountActive, setAccountActive] = useState(true);
  const [colorMode, setColorMode] = useState<ColorMode>("light");
  const [language, setLanguage] = useState<AppLanguage>("es");
  const [homesLoadStatus, setHomesLoadStatus] =
    useState<DataLoadStatus>("loading");

  const [deviceLoadStatusByHome, setDeviceLoadStatusByHome] =
    useState<Record<string, DataLoadStatus>>({});

  const [lastSync, setLastSync] = useState(getTimeStamp());
  const {
    sessionName,
    sessionEmail,
    sessionRole,
    sessionRevision,
    setSessionName,
    setSessionEmail,
    setSessionRole,
  } = useSessionLifecycle();

  useHomeDataLoader({
    sessionRevision,
    setHomes,
    setHomesLoadStatus,
    setDeviceLoadStatusByHome,
    setHomeMembersByHome,
    setIncomingInvitations,
    setActiveHomeId,
    setDevices,
    setSessionRole,
  });

  // Alertas Smart Home ya resueltas por el usuario.
  const [resolvedSmartAlerts, setResolvedSmartAlerts] = useState<string[]>([]);

  // Identificar al usuario propietario de los datos locales.
  const sessionOwnerRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;

    const getOwnerKey = (
      session: Awaited<ReturnType<typeof loadSession>>,
    ): string | null => {
      if (!session) return null;

      return session.user.id
        ? `id:${session.user.id}`
        : `email:${session.user.email.trim().toLowerCase()}`;
    };

    // La limpieza ocurre al notificarse un cambio real de sesion.
    const unsubscribe = subscribeToSessionChanges((session) => {
      const nextOwner = getOwnerKey(session);

      // Una renovacion JWT del mismo usuario no borra sus datos.
      if (sessionOwnerRef.current === nextOwner) {
        return;
      }

      sessionOwnerRef.current = nextOwner;
      setHomeConsumptionGoals({});
      setResolvedSmartAlerts([]);
    });

    // Reconocer una sesion existente al abrir la aplicacion.
    void loadSession()
      .then((session) => {
        if (active && sessionOwnerRef.current === null) {
          sessionOwnerRef.current = getOwnerKey(session);
        }
      })
      .catch(() => {
        // La restauracion de sesion se maneja en autenticacion.
      });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

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
  });

  useRealtimeSync({
    sessionRevision,
    setDevices,
    setNotifications,
    setUnreadNotificationCount,
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
      homesLoadStatus,
      deviceLoadStatusByHome,
      homeMembersByHome,
      incomingInvitations,
      notifications,
      unreadNotificationCount,
      sessionEmail,
      sessionRole,
      accessibleHomes,
      language,
      lastSync,
      resolvedSmartAlerts,
      sessionName,
      deactivateAccount: async () => {
        await authService.deactivateAccount();
        setAccountActive(false);
        await clearSession();
      },
      removeDevice,
      updateDevice,
      addHome: async (name) => {
        const cleanName = name.trim();

        if (!cleanName) {
          throw new Error("Escribe un nombre para el hogar.");
        }

        const created = await smartHomeService.createHome({
          name: cleanName,
        });

        const nextHome = {
          ...created,
          location: created.location ?? "Hogar",
          favorite: created.favorite ?? false,
        };

        setHomes((items) => {
          const exists = items.some((item) => item.id === nextHome.id);
          return exists ? items : [...items, nextHome];
        });

        setActiveHomeId(nextHome.id);
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
      homesLoadStatus,
      deviceLoadStatusByHome,
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
