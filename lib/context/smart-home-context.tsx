import {
  createContext,
  PropsWithChildren,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Appearance, Platform, useColorScheme } from "react-native";

import type { SmartDevice } from "@/lib/domain/device";
import type {
  AppLanguage,
  ColorMode,
  EffectiveColorMode,
} from "@/lib/domain/preferences";
import {
  loadColorModePreference,
  saveColorModePreference,
} from "@/lib/preferences/appearance-preferences";
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
  loadHomeFavoriteOverrides,
  saveHomeFavoriteOverrides,
} from "@/lib/preferences/home-favorites";
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
  effectiveColorMode: EffectiveColorMode;
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
  updateHome: (homeId: string, name: string) => Promise<void>;
  deleteHome: (homeId: string) => Promise<void>;
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
  toggleHomeFavorite: (homeId: string) => Promise<void>;
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
  const [favoritePreferences, setFavoritePreferences] = useState<{
    ownerKey: string | null;
    overrides: Record<string, boolean>;
    loaded: boolean;
  }>({ ownerKey: null, overrides: {}, loaded: false });
  const favoritePreferencesRef = useRef(favoritePreferences);
  const [sessionOwnerKey, setSessionOwnerKey] = useState<string | null>(null);
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
  const [colorMode, setColorModeState] = useState<ColorMode>("system");
  const systemColorScheme = useColorScheme();
  const effectiveColorMode =
    colorMode === "system"
      ? systemColorScheme === "dark"
        ? "dark"
        : "light"
      : colorMode;
  const colorModeTouchedRef = useRef(false);
  const [language, setLanguage] = useState<AppLanguage>("es");
  const [homesLoadStatus, setHomesLoadStatus] =
    useState<DataLoadStatus>("loading");

  const [deviceLoadStatusByHome, setDeviceLoadStatusByHome] =
    useState<Record<string, DataLoadStatus>>({});

  useEffect(() => {
    let active = true;

    void loadColorModePreference()
      .then((storedMode) => {
        if (active && !colorModeTouchedRef.current && storedMode) {
          setColorModeState(storedMode);
        }
      })
      .catch((error: unknown) => {
        console.warn("[Appearance] No se pudo cargar la preferencia.", error);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") {
      Appearance.setColorScheme(
        colorMode === "system" ? "unspecified" : colorMode,
      );
    }
  }, [colorMode]);

  const setColorMode = useCallback((mode: ColorMode) => {
    colorModeTouchedRef.current = true;
    setColorModeState(mode);

    void saveColorModePreference(mode).catch((error: unknown) => {
      console.warn("[Appearance] No se pudo guardar la preferencia.", error);
    });
  }, []);

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
      setSessionOwnerKey(nextOwner);

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
          const ownerKey = getOwnerKey(session);
          sessionOwnerRef.current = ownerKey;
          setSessionOwnerKey(ownerKey);
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

  useEffect(() => {
    let active = true;
    const emptyPreferences = {
      ownerKey: sessionOwnerKey,
      overrides: {} as Record<string, boolean>,
      loaded: !sessionOwnerKey,
    };

    favoritePreferencesRef.current = emptyPreferences;
    setFavoritePreferences(emptyPreferences);

    if (!sessionOwnerKey) return () => {
      active = false;
    };

    void loadHomeFavoriteOverrides(sessionOwnerKey)
      .then((overrides) => {
        if (!active) return;

        const loadedPreferences = {
          ownerKey: sessionOwnerKey,
          overrides,
          loaded: true,
        };
        favoritePreferencesRef.current = loadedPreferences;
        setFavoritePreferences(loadedPreferences);
      })
      .catch((error: unknown) => {
        if (active) {
          const fallbackPreferences = {
            ownerKey: sessionOwnerKey,
            overrides: {} as Record<string, boolean>,
            loaded: true,
          };
          favoritePreferencesRef.current = fallbackPreferences;
          setFavoritePreferences(fallbackPreferences);
        }
        console.warn("[Favorites] No se pudieron cargar los favoritos locales.", error);
      });

    return () => {
      active = false;
    };
  }, [sessionOwnerKey]);

  const activeFavoriteOverrides =
    favoritePreferences.ownerKey === sessionOwnerKey
      ? favoritePreferences.overrides
      : {};
  const accessibleHomes = useMemo(
    () =>
      homes.map((home) =>
        Object.prototype.hasOwnProperty.call(activeFavoriteOverrides, home.id)
          ? { ...home, favorite: activeFavoriteOverrides[home.id] ?? false }
          : home,
      ),
    [activeFavoriteOverrides, homes],
  );

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
      effectiveColorMode,
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
          homeRole: "OWNER" as const,
        };

        setHomes((items) => {
          const exists = items.some((item) => item.id === nextHome.id);
          return exists ? items : [...items, nextHome];
        });

        setDeviceLoadStatusByHome((current) => ({
          ...current,
          [nextHome.id]: "loaded",
        }));

        setActiveHomeId(nextHome.id);
      },
      updateHome: async (homeId, name) => {
        const cleanName = name.trim();

        if (!cleanName || cleanName.length > 100) {
          throw new Error("El nombre debe tener entre 1 y 100 caracteres.");
        }

        const target = homes.find((home) => home.id === homeId);

        if (!target || target.homeRole !== "OWNER") {
          throw new Error(
            "Solo el propietario puede cambiar el nombre del hogar.",
          );
        }

        const updatedHome = await smartHomeService.updateHome(
          homeId,
          cleanName,
        );

        setHomes((current) =>
          current.map((home) =>
            home.id === homeId
              ? { ...home, name: updatedHome.name }
              : home,
          ),
        );
      },
      deleteHome: async (homeId) => {
        const target = homes.find((home) => home.id === homeId);

        if (!target || target.homeRole !== "OWNER") {
          throw new Error(
            "Solo el propietario puede eliminar este hogar.",
          );
        }

        const result = await smartHomeService.deleteHome(homeId);

        if (!result.deleted) {
          throw new Error(
            "El servidor no confirmó la eliminación del hogar.",
          );
        }

        const remainingHomes = homes.filter((home) => home.id !== homeId);
        setHomes(remainingHomes);
        setActiveHomeId((active) =>
          active === homeId ? remainingHomes[0]?.id ?? "" : active,
        );
        setHomeMembersByHome((current) => {
          const next = { ...current };
          delete next[homeId];
          return next;
        });
        setDevices((current) =>
          current.filter((device) => device.homeId !== homeId),
        );
        setDeviceLoadStatusByHome((current) => {
          const next = { ...current };
          delete next[homeId];
          return next;
        });
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
      // Guarda la preferencia localmente por cuenta mientras la API no la persiste.
      toggleHomeFavorite: async (homeId) => {
        if (!sessionOwnerKey) {
          throw new Error("Inicia sesión para guardar favoritos.");
        }

        const target = accessibleHomes.find((home) => home.id === homeId);
        if (!target) return;

        const previousPreferences = favoritePreferencesRef.current;
        if (
          previousPreferences.ownerKey !== sessionOwnerKey ||
          !previousPreferences.loaded
        ) {
          throw new Error("Espera a que se carguen tus hogares favoritos.");
        }

        const currentFavorite = Object.prototype.hasOwnProperty.call(
          previousPreferences.overrides,
          homeId,
        )
          ? previousPreferences.overrides[homeId] ?? false
          : target.favorite;
        const nextPreferences = {
          ownerKey: sessionOwnerKey,
          loaded: true,
          overrides: {
            ...previousPreferences.overrides,
            [homeId]: !currentFavorite,
          },
        };

        favoritePreferencesRef.current = nextPreferences;
        setFavoritePreferences(nextPreferences);

        try {
          await saveHomeFavoriteOverrides(
            sessionOwnerKey,
            nextPreferences.overrides,
          );
        } catch (error) {
          if (favoritePreferencesRef.current === nextPreferences) {
            favoritePreferencesRef.current = previousPreferences;
            setFavoritePreferences(previousPreferences);
          }
          throw error;
        }
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
      effectiveColorMode,
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
      setColorMode,
      accessibleHomes,
      language,
      lastSync,
      resolvedSmartAlerts,
      sessionName,
      toggleDevice,
      unreadNotificationCount,
      updateDevice,
      sessionOwnerKey,
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
