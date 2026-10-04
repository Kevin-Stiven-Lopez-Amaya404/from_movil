import { apiClient } from "@/lib/api/api-client";
import { ApiError } from "@/lib/api/api-error";
import { useMockApi } from "@/lib/config/api-config";
import {
    type ReportRange,
    type SmartDevice,
    type SmartHomePlace,
} from "@/lib/context/smart-home-context";

export type ReportPoint = {
  label: string;
  value: number;
};

export type CreateHomeRequest = {
  name: string;
  location?: string;
};

export type CreateDeviceRequest = {
  homeId: string;
  name: string;
  deviceTypeId?: string;
  manufacturerDeviceId?: string;
  transportType?: "WIFI" | "BLUETOOTH";
  messagingProtocol?: "MQTT";
};

export type UpdateDeviceRequest = {
  name?: string;
  deviceTypeId?: string;
  transportType?: "WIFI" | "BLUETOOTH";
  messagingProtocol?: "MQTT";
};

export type HomeRole = "OWNER" | "MEMBER" | "GUEST";
export type HomeMemberStatus = "PENDING" | "ACTIVE" | "REVOKED" | "LEFT";

export type HomeMember = {
  id: string;
  homeId: string;
  userId: string;
  role: HomeRole;
  status: HomeMemberStatus | string;
  invitedBy: string | null;
  invitedAt: string;
  acceptedAt?: string | null;
  endedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type BackendDevice = {
  id: string;
  homeId: string;
  deviceTypeId?: string;
  name: string;
  status?: string;
  connectivityStatus?: "ONLINE" | "OFFLINE";
  isOn?: boolean;
  currentPowerW?: number | null;
  energyTotalKwh?: number | null;
  voltageV?: number | null;
  currentA?: number | null;
  frequencyHz?: number | null;
  temperatureC?: number | null;
  manufacturerDeviceId?: string | null;
  transportType?: "WIFI" | "BLUETOOTH" | null;
  messagingProtocol?: "MQTT" | null;
  updatedAt?: string;
};

function mapBackendDevice(device: BackendDevice): SmartDevice {
  return {
    id: device.id,
    homeId: device.homeId,
    name: device.name,
    category: "Electrodomesticos",
    icon: "power-plug-outline",
    power: device.currentPowerW ?? 0,
    energy: (device.energyTotalKwh ?? 0) * 1000,
    voltage: device.voltageV ?? 0,
    current: device.currentA ?? 0,
    frequency: device.frequencyHz ?? 0,
    online: device.connectivityStatus === "ONLINE",
    temperature: device.temperatureC ?? undefined,
    state: device.isOn ? "on" : "off",
    yesterday: 0,
    lastStateChange: device.updatedAt,
  };
}

export interface SmartHomeService {
  listHomes(token?: string): Promise<SmartHomePlace[]>;
  listHomeMembers(homeId: string, token?: string): Promise<HomeMember[]>;
  inviteHomeMember(
    homeId: string,
    email: string,
    role: Exclude<HomeRole, "OWNER">,
    token?: string,
  ): Promise<HomeMember>;
  createHome(
    request: CreateHomeRequest,
    token?: string,
  ): Promise<SmartHomePlace>;
  toggleHomeFavorite(
    homeId: string,
    favorite: boolean,
    token?: string,
  ): Promise<SmartHomePlace>;
  listDevices(homeId?: string, token?: string): Promise<SmartDevice[]>;
  createDevice(
    request: CreateDeviceRequest,
    token?: string,
  ): Promise<SmartDevice>;
  updateDeviceState(
    homeId: string,
    deviceId: string,
    state: "on" | "off",
    token?: string,
  ): Promise<SmartDevice>;
  updateDevice(
    homeId: string,
    deviceId: string,
    request: UpdateDeviceRequest,
    token?: string,
  ): Promise<SmartDevice>;
  deleteDevice(homeId: string, deviceId: string, token?: string): Promise<void>;
  activateDevice(
    homeId: string,
    deviceId: string,
    token?: string,
  ): Promise<SmartDevice>;
  deactivateDevice(
    homeId: string,
    deviceId: string,
    token?: string,
  ): Promise<SmartDevice>;
  setAllHomeDevicesState(
    homeId: string,
    state: "on" | "off",
    token?: string,
  ): Promise<SmartDevice[]>;
  getReports(range: ReportRange, token?: string): Promise<ReportPoint[]>;
}

function createMockId(value: string) {
  return `${
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, "-") || "item"
  }-${Date.now()}`;
}

function getLocalTimestamp() {
  return new Intl.DateTimeFormat("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

const mockHomes: SmartHomePlace[] = [
  {
    id: "casa",
    name: "Casa",
    location: "Hogar principal",
    favorite: true,
  },
  {
    id: "oficina",
    name: "Oficina",
    location: "Espacio de trabajo",
    favorite: false,
  },
];

const mockDevices: SmartDevice[] = [
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

const mockReportData: Record<ReportRange, ReportPoint[]> = {
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

const mockSmartHomeService: SmartHomeService = {
  async listHomes() {
    return [...mockHomes];
  },

  async listHomeMembers() {
    throw new ApiError(
      "Las membresías requieren conexión con el backend.",
      "NETWORK_ERROR",
    );
  },

  async inviteHomeMember() {
    throw new ApiError(
      "Las invitaciones requieren conexión con el backend.",
      "NETWORK_ERROR",
    );
  },

  async createHome({ name, location }) {
    const home: SmartHomePlace = {
      id: createMockId(name),
      name: name.trim(),
      location: location?.trim() || "Nuevo hogar",
      favorite: mockHomes.length === 0,
    };

    mockHomes.push(home);

    return home;
  },

  async toggleHomeFavorite(homeId, favorite) {
    const index = mockHomes.findIndex((home) => home.id === homeId);

    if (index >= 0) {
      mockHomes[index] = {
        ...mockHomes[index],
        favorite,
      };

      return mockHomes[index];
    }

    throw new Error("Hogar no encontrado.");
  },

  async listDevices(homeId) {
    if (!homeId) return [...mockDevices];
    return mockDevices.filter((device) => device.homeId === homeId);
  },

  async createDevice(request) {
    const device: SmartDevice = {
      id: createMockId(request.name),
      homeId: request.homeId,
      name: request.name.trim(),
      category: "Electrodomesticos",
      icon: "power-plug-outline",
      power: 0,
      energy: 0,
      yesterday: 0,
      voltage: 120,
      current: 0,
      frequency: 60,
      online: true,
      state: "off",
    };

    mockDevices.push(device);

    return device;
  },

  async updateDeviceState(_homeId, deviceId, state) {
    const index = mockDevices.findIndex((device) => device.id === deviceId);

    if (index >= 0) {
      mockDevices[index] = {
        ...mockDevices[index],
        state,
        lastStateChange: getLocalTimestamp(),
      };

      return mockDevices[index];
    }

    throw new Error("Dispositivo no encontrado.");
  },

  async updateDevice(_homeId, deviceId, request) {
    const index = mockDevices.findIndex((device) => device.id === deviceId);
    if (index < 0) throw new Error("Dispositivo no encontrado.");

    mockDevices[index] = { ...mockDevices[index], ...request };
    return mockDevices[index];
  },

  async deleteDevice(_homeId, deviceId) {
    const index = mockDevices.findIndex((device) => device.id === deviceId);
    if (index < 0) throw new Error("Dispositivo no encontrado.");
    mockDevices.splice(index, 1);
  },

  async activateDevice(_homeId, deviceId) {
    const device = mockDevices.find((item) => item.id === deviceId);
    if (!device) throw new Error("Dispositivo no encontrado.");
    device.online = true;
    return device;
  },

  async deactivateDevice(_homeId, deviceId) {
    const device = mockDevices.find((item) => item.id === deviceId);
    if (!device) throw new Error("Dispositivo no encontrado.");
    device.online = false;
    return device;
  },

  async setAllHomeDevicesState(homeId, state) {
    const timestamp = getLocalTimestamp();
    const updated: SmartDevice[] = [];

    for (let i = 0; i < mockDevices.length; i++) {
      if (mockDevices[i].homeId === homeId) {
        mockDevices[i] = {
          ...mockDevices[i],
          state,
          lastStateChange: timestamp,
        };
        updated.push(mockDevices[i]);
      }
    }

    return updated;
  },

  async getReports(range) {
    return mockReportData[range];
  },
};

const backendSmartHomeService: SmartHomeService = {
  listHomes(token) {
    return apiClient
      .get<Array<SmartHomePlace & { favorite?: boolean }>>("/api/v1/homes", {
        token,
      })
      .then((homes) =>
        homes.map((home) => ({
          id: home.id,
          name: home.name,
          location: home.location ?? "Hogar",
          favorite: home.favorite ?? false,
        })),
      );
  },

  listHomeMembers(homeId, token) {
    return apiClient.get<HomeMember[]>(
      `/api/v1/homes/${encodeURIComponent(homeId)}/members`,
      { token },
    );
  },

  inviteHomeMember(homeId, email, role, token) {
    return apiClient.post<
      HomeMember,
      { email: string; role: Exclude<HomeRole, "OWNER"> }
    >(
      `/api/v1/homes/${encodeURIComponent(homeId)}/invitations`,
      { email: email.trim().toLowerCase(), role },
      { token },
    );
  },

  createHome(request, token) {
    return apiClient
      .post<SmartHomePlace, { name: string }>(
        "/api/v1/homes",
        {
          name: request.name,
        },
        { token },
      )
      .then((home) => ({
        ...home,
        location: home.location ?? request.location ?? "Hogar",
        favorite: home.favorite ?? false,
      }));
  },

  toggleHomeFavorite() {
    throw new ApiError(
      "El backend todavía no expone favoritos de hogares.",
      "UNKNOWN_ERROR",
    );
  },

  listDevices(homeId, token) {
    if (!homeId) return Promise.resolve([]);

    return apiClient
      .get<BackendDevice[]>(`/api/v1/homes/${homeId}/devices`, { token })
      .then((devices) => devices.map((device) => mapBackendDevice(device)));
  },

  createDevice(request, token) {
    if (!request.deviceTypeId) {
      throw new ApiError(
        "Selecciona un tipo de dispositivo válido.",
        "VALIDATION_ERROR",
      );
    }

    return apiClient
      .post<BackendDevice, Record<string, unknown>>(
        `/api/v1/homes/${request.homeId}/devices`,
        {
          deviceTypeId: request.deviceTypeId,
          name: request.name,
          ...(request.manufacturerDeviceId
            ? { manufacturerDeviceId: request.manufacturerDeviceId }
            : {}),
          ...(request.transportType
            ? { transportType: request.transportType }
            : {}),
          ...(request.messagingProtocol
            ? { messagingProtocol: request.messagingProtocol }
            : {}),
        },
        { token },
      )
      .then(mapBackendDevice);
  },

  updateDeviceState(homeId, deviceId, state, token) {
    return apiClient
      .patch<
        BackendDevice,
        { command: "TURN_ON" | "TURN_OFF" }
      >(`/api/v1/homes/${homeId}/devices/${deviceId}/control`, { command: state === "on" ? "TURN_ON" : "TURN_OFF" }, { token })
      .then(mapBackendDevice);
  },

  updateDevice(homeId, deviceId, request, token) {
    return apiClient
      .patch<
        BackendDevice,
        UpdateDeviceRequest
      >(`/api/v1/homes/${homeId}/devices/${deviceId}`, request, { token })
      .then(mapBackendDevice);
  },

  deleteDevice(homeId, deviceId, token) {
    return apiClient.delete<void>(
      `/api/v1/homes/${homeId}/devices/${deviceId}`,
      { token },
    );
  },

  setAllHomeDevicesState(homeId, state, token) {
    return Promise.reject(
      new ApiError(
        "El backend sólo permite controlar dispositivos individualmente.",
        "UNKNOWN_ERROR",
      ),
    );
  },

  getReports(range, token) {
    return apiClient.get<ReportPoint[]>(
      `/reports?range=${encodeURIComponent(range)}`,
      { token },
    );
  },

  activateDevice(homeId, deviceId, token) {
    return apiClient
      .patch<BackendDevice>(
        `/api/v1/homes/${homeId}/devices/${deviceId}/activate`,
        undefined,
        { token },
      )
      .then(mapBackendDevice);
  },

  deactivateDevice(homeId, deviceId, token) {
    return apiClient
      .patch<BackendDevice>(
        `/api/v1/homes/${homeId}/devices/${deviceId}/deactivate`,
        undefined,
        { token },
      )
      .then(mapBackendDevice);
  },
};

export const smartHomeService: SmartHomeService = new Proxy(
  mockSmartHomeService,
  {
    get(_target, property) {
      const service = useMockApi
        ? mockSmartHomeService
        : backendSmartHomeService;
      const value: unknown = Reflect.get(service, property, service);
      return typeof value === "function" ? value.bind(service) : value;
    },
  },
);
