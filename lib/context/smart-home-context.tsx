import {
    createContext,
    PropsWithChildren,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import { useMockApi } from "@/lib/config/api-config";
import { authService } from "@/lib/services/auth-service";
import {
    notificationsService,
    type SmartNotification,
} from "@/lib/services/notifications-service";
import {
    realtimeService,
    type DeviceStatusUpdatedEvent,
} from "@/lib/services/realtime-service";
import {
    smartHomeService,
    type HomeInvitation,
    type HomeMember,
    type HomeRole,
} from "@/lib/services/smart-home-service";
import {
    loadSession,
    subscribeToSessionChanges,
} from "@/lib/session/session-store";

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
  homeRole?: HomeRole;
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
  lastSeenAt?: string | null;
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
  resolvedAlerts: string[];
  resolvedSmartAlerts: string[];
  sessionName: string;
  offlineMode: boolean;
  lastSync: string;
  deactivateAccount: () => void;
  closeActiveDevices: (deviceIds: string[]) => void;
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
  setAllHomeDevicesState: (homeId: string, state: "on" | "off") => void;
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
  toggleDevice: (id: string) => void;
  toggleHomeFavorite: (homeId: string) => void;
  setDeviceOnline: (id: string, online: boolean) => void;
  resolveDeviceAlert: (id: string) => void;
  resolveSmartDeviceAlert: (id: string) => void;
  refreshSync: () => void;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  dismissNotification: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
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
  const [activeDevices, setActiveDevices] = useState(defaultActiveDevices);
  const [accountActive, setAccountActive] = useState(true);
  const [colorMode, setColorMode] = useState<ColorMode>("light");
  const [language, setLanguage] = useState<AppLanguage>("es");
  const [offlineMode, setOfflineMode] = useState(false);
  const [sessionName, setSessionName] = useState(useMockApi ? "Pepe" : "");
  const [sessionEmail, setSessionEmail] = useState(
    useMockApi ? "pepe@smarthome.com" : "",
  );
  const [sessionRole, setSessionRole] = useState<UserRole>("miembro");
  const [lastSync, setLastSync] = useState(getTimeStamp());
  const [sessionRevision, setSessionRevision] = useState(0);

  useEffect(() => {
    return subscribeToSessionChanges((session) => {
      setSessionRevision((revision) => revision + 1);
      if (!session) {
        setSessionName("");
        setSessionEmail("");
        setSessionRole("miembro");
        return;
      }

      if (session.mode === "demo") {
        setSessionName(session.user.name.split(" ")[0] || session.user.name);
        setSessionEmail(session.user.email);
        setSessionRole(session.user.role ?? "miembro");
        setHomes(initialHomes);
        setHomeMembersByHome({});
        setDevices(initialDevices);
        setActiveHomeId(initialHomes[0].id);
        setNotifications([]);
        setUnreadNotificationCount(0);
        setOfflineMode(false);
      }
    });
  }, [router]);

  useEffect(() => {
    let active = true;

    loadSession()
      .then((session) => {
        if (!active) return;
        if (!session) {
          setSessionName("");
          setSessionEmail("");
          setSessionRole("miembro");
          return;
        }

        setSessionName(session.user.name.split(" ")[0] || session.user.name);
        setSessionEmail(session.user.email);
        setSessionRole(session.user.role ?? "miembro");
      })
      .catch(() => {
        // La pantalla de autenticación mostrará el error de red al reintentar.
      });

    return () => {
      active = false;
    };
  }, [sessionRevision]);

  useEffect(() => {
    if (useMockApi) return;

    let active = true;
    const unsubscribers: Array<() => void> = [];

    loadSession()
      .then((session) => {
        if (!active || !session) return;

        realtimeService.connect();
        unsubscribers.push(
          realtimeService.on(
            "device.status.updated",
            (event: DeviceStatusUpdatedEvent) => {
              const deviceId = event.deviceId ?? event.id;
              if (!deviceId) return;

              setDevices((items) =>
                items.map((device) =>
                  device.id === deviceId
                    ? {
                        ...device,
                        ...(event.homeId ? { homeId: event.homeId } : {}),
                        ...(event.currentPowerW !== undefined
                          ? { power: event.currentPowerW ?? 0 }
                          : {}),
                        ...(event.energyTotalKwh !== undefined
                          ? { energy: (event.energyTotalKwh ?? 0) * 1000 }
                          : {}),
                        ...(event.voltageV !== undefined
                          ? { voltage: event.voltageV ?? 0 }
                          : {}),
                        ...(event.currentA !== undefined
                          ? { current: event.currentA ?? 0 }
                          : {}),
                        ...(event.frequencyHz !== undefined
                          ? { frequency: event.frequencyHz ?? 0 }
                          : {}),
                        ...(event.temperatureC !== undefined
                          ? { temperature: event.temperatureC ?? undefined }
                          : {}),
                        ...(event.connectivityStatus !== undefined
                          ? { online: event.connectivityStatus === "ONLINE" }
                          : {}),
                        ...(event.isOn !== undefined
                          ? { state: event.isOn ? "on" : "off" }
                          : {}),
                        ...(event.updatedAt || event.readAt
                          ? { lastStateChange: event.updatedAt ?? event.readAt }
                          : {}),
                      }
                    : device,
                ),
              );
            },
          ),
          realtimeService.on("notification.created", (event) => {
            const notification = event as SmartNotification;
            if (!notification.id) return;
            setNotifications((items) => [
              notification,
              ...items.filter((item) => item.id !== notification.id),
            ]);
            if (notification.status === "UNREAD") {
              setUnreadNotificationCount((count) => count + 1);
            }
          }),
          realtimeService.on("notification.unread_count.updated", (event) => {
            if (event.unreadCount !== undefined) {
              setUnreadNotificationCount(event.unreadCount);
            }
          }),
          realtimeService.on("consumption.created", () => {
            setLastSync(getTimeStamp());
          }),
          realtimeService.on("realtime.connected", () => {
            setOfflineMode(false);
            setLastSync(getTimeStamp());
          }),
          realtimeService.on("realtime.error", () => {
            setOfflineMode(true);
          }),
        );
      })
      .catch(() => {
        if (active) setOfflineMode(true);
      });

    return () => {
      active = false;
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      realtimeService.disconnect();
    };
  }, [sessionRevision]);

  useEffect(() => {
    if (useMockApi) return;

    let active = true;

    loadSession()
      .then((session) => {
        if (!active || !session) {
          setNotifications([]);
          setUnreadNotificationCount(0);
          return;
        }
        return Promise.all([
          notificationsService.list({ limit: 50 }),
          notificationsService.unreadCount(),
        ]).then(([items, count]) => {
          if (!active) return;
          setNotifications(items);
          setUnreadNotificationCount(count);
        });
      })
      .catch(() => {
        if (active) setOfflineMode(true);
      });

    return () => {
      active = false;
    };
  }, [sessionRevision]);

  useEffect(() => {
    if (useMockApi) return;

    let active = true;

    loadSession()
      .then(async (session) => {
        if (!session) {
          if (active) {
            setHomes([]);
            setHomeMembersByHome({});
            setIncomingInvitations([]);
            setDevices([]);
            setActiveHomeId("");
            setOfflineMode(false);
          }
          return;
        }

        const [listedHomes, currentUser, pendingInvitations] = await Promise.all([
          smartHomeService.listHomes(),
          authService.getCurrentUser(),
          smartHomeService.listIncomingInvitations(),
        ]);
        const currentUserId = currentUser.userId ?? currentUser.id ?? "";
        const memberEntries = await Promise.all(
          listedHomes.map(
            async (home) =>
              [
                home.id,
                await smartHomeService.listHomeMembers(home.id),
              ] as const,
          ),
        );
        const membersByHome = Object.fromEntries(memberEntries);
        const remoteHomes = listedHomes.map((home) => {
          const currentMembership = membersByHome[home.id]?.find(
            (member) =>
              member.userId === currentUserId &&
              member.status === "ACTIVE",
          );
          return {
            ...home,
            homeRole: currentMembership?.role,
          };
        });
        if (!active) return;

        const firstHome = remoteHomes[0];
        setHomes(remoteHomes);
        setHomeMembersByHome(membersByHome);
        setIncomingInvitations(pendingInvitations);
        const firstMembership = remoteHomes.find(
          (home) => home.homeRole,
        )?.homeRole;
        if (firstMembership) {
          setSessionRole(
            firstMembership === "OWNER"
              ? "admin"
              : firstMembership === "GUEST"
                ? "invitado"
                : "miembro",
          );
        }
        setActiveHomeId((current) =>
          remoteHomes.some((home) => home.id === current)
            ? current
            : (firstHome?.id ?? ""),
        );

        const remoteDevices = (
          await Promise.all(
            remoteHomes.map((home) => smartHomeService.listDevices(home.id)),
          )
        ).flat();

        if (active) setDevices(remoteDevices);
      })
      .catch(() => {
        if (active) setOfflineMode(true);
      });

    return () => {
      active = false;
    };
  }, [sessionRevision]);

  // Alertas Smart Home ya resueltas por el usuario.
  // Se mantiene separado de activeDevices porque ese estado pertenece
  // a la seguridad/sesiones de la cuenta.
  const [resolvedSmartAlerts, setResolvedSmartAlerts] = useState<string[]>([]);

  const accessibleHomes = homes;

  const applyDeviceControlState = async (id: string, state: "on" | "off") => {
    const device = devices.find((item) => item.id === id);
    if (!device || !device.online) return;

    const previousDevice = device;

    setDevices((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, state, lastStateChange: getTimeStamp() }
          : item,
      ),
    );

    try {
      const updated = await smartHomeService.updateDeviceState(
        device.homeId,
        id,
        state,
      );

      setDevices((items) =>
        items.map((item) => (item.id === id ? updated : item)),
      );
    } catch (error) {
      setDevices((items) =>
        items.map((item) => (item.id === id ? previousDevice : item)),
      );
      throw error;
    }
  };

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
      resolvedAlerts: activeDevices
        .filter((item) => item.verified)
        .map((item) => item.id),
      resolvedSmartAlerts,
      sessionName,
      deactivateAccount: () => {
        setAccountActive(false);
        setOfflineMode(false);
      },
      closeActiveDevices: (deviceIds) => {
        setActiveDevices((items) =>
          items.filter((item) => !deviceIds.includes(item.id)),
        );
      },
      removeDevice: async (deviceId) => {
        const device = devices.find((item) => item.id === deviceId);
        if (!device) return;
        await smartHomeService.deleteDevice(device.homeId, deviceId);
        setDevices((items) => items.filter((device) => device.id !== deviceId));
      },
      updateDevice: async (deviceId, updates) => {
        const device = devices.find((item) => item.id === deviceId);
        if (!device) return;
        const updated = await smartHomeService.updateDevice(
          device.homeId,
          deviceId,
          updates,
        );
        setDevices((items) =>
          items.map((device) => (device.id === deviceId ? updated : device)),
        );
      },
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
      // Cambia el estado online/offline de un dispositivo.
      toggleDevice: (id) => {
        const device = devices.find((item) => item.id === id);
        if (!device || !device.online) return;

        void applyDeviceControlState(id, device.state === "on" ? "off" : "on");
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
        // Un cambio manual de estado inicia un nuevo ciclo de evaluación
        // para ese dispositivo.
        setResolvedSmartAlerts((alerts) =>
          alerts.filter((alertId) => alertId !== id),
        );
      },
      setHomeDeviceState: applyDeviceControlState,
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

      markNotificationAsRead: async (notificationId) => {
        await notificationsService.markAsRead(notificationId);
        setNotifications((items) =>
          items.map((item) =>
            item.id === notificationId ? { ...item, status: "READ" } : item,
          ),
        );
        setUnreadNotificationCount((count) => Math.max(0, count - 1));
      },

      dismissNotification: async (notificationId) => {
        const target = notifications.find((item) => item.id === notificationId);
        const next = await notificationsService.dismiss(notificationId);
        setNotifications((items) =>
          items.map((item) =>
            item.id === notificationId
              ? { ...item, status: next.status ?? "DISMISSED" }
              : item,
          ),
        );
        if (target?.status === "UNREAD") {
          setUnreadNotificationCount((count) => Math.max(0, count - 1));
        }
      },

      markAllNotificationsAsRead: async () => {
        await notificationsService.markAllAsRead();
        setNotifications((items) =>
          items.map((item) => ({ ...item, status: "READ" })),
        );
        setUnreadNotificationCount(0);
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
      homeMembersByHome,
      incomingInvitations,
      notifications,
      sessionEmail,
      sessionRole,
      accessibleHomes,
      language,
      lastSync,
      offlineMode,
      resolvedSmartAlerts,
      sessionName,
      unreadNotificationCount,
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
