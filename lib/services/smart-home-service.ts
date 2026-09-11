import { apiClient } from "@/lib/api/api-client";
import { useMockApi } from "@/lib/config/api-config";
import {
    type DeviceCategory,
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
  category?: DeviceCategory;
  room?: string;
  icon?: string;
};

export type UpdateDeviceStatusRequest = {
  online: boolean;
};

export interface SmartHomeService {
  listHomes(token?: string): Promise<SmartHomePlace[]>;
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
  updateDeviceStatus(
    deviceId: string,
    request: UpdateDeviceStatusRequest,
    token?: string,
  ): Promise<SmartDevice>;
  updateDeviceState(
    deviceId: string,
    state: "on" | "off",
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
      category: request.category ?? "Electrodomesticos",
      room: request.room?.trim() || "General",
      icon: request.icon ?? "power-plug-outline",
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

  async updateDeviceStatus(deviceId, { online }) {
    const index = mockDevices.findIndex((device) => device.id === deviceId);

    if (index >= 0) {
      mockDevices[index] = {
        ...mockDevices[index],
        online,
      };

      return mockDevices[index];
    }

    throw new Error("Dispositivo no encontrado.");
  },

  async updateDeviceState(deviceId, state) {
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
    return apiClient.get<SmartHomePlace[]>("/homes", { token });
  },

  createHome(request, token) {
    return apiClient.post<SmartHomePlace, CreateHomeRequest>(
      "/homes",
      request,
      { token },
    );
  },

  toggleHomeFavorite(homeId, favorite, token) {
    return apiClient.patch<SmartHomePlace, { favorite: boolean }>(
      `/homes/${homeId}/favorite`,
      { favorite },
      { token },
    );
  },

  listDevices(homeId, token) {
    const path = homeId ? `/homes/${homeId}/devices` : "/devices";
    return apiClient.get<SmartDevice[]>(path, { token });
  },

  createDevice(request, token) {
    return apiClient.post<SmartDevice, CreateDeviceRequest>(
      `/homes/${request.homeId}/devices`,
      request,
      { token },
    );
  },

  updateDeviceStatus(deviceId, request, token) {
    return apiClient.patch<SmartDevice, UpdateDeviceStatusRequest>(
      `/devices/${deviceId}/status`,
      request,
      { token },
    );
  },

  updateDeviceState(deviceId, state, token) {
    return apiClient.patch<SmartDevice, { state: "on" | "off" }>(
      `/devices/${deviceId}/state`,
      { state },
      { token },
    );
  },

  setAllHomeDevicesState(homeId, state, token) {
    return apiClient.patch<SmartDevice[], { state: "on" | "off" }>(
      `/homes/${homeId}/devices/state`,
      { state },
      { token },
    );
  },

  getReports(range, token) {
    return apiClient.get<ReportPoint[]>(
      `/reports?range=${encodeURIComponent(range)}`,
      { token },
    );
  },
};

export const smartHomeService: SmartHomeService = useMockApi
  ? mockSmartHomeService
  : backendSmartHomeService;
