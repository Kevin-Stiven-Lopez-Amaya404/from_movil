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
  createHome(request: CreateHomeRequest, token?: string): Promise<SmartHomePlace>;
  toggleHomeFavorite(homeId: string, favorite: boolean, token?: string): Promise<SmartHomePlace>;
  listDevices(homeId: string, token?: string): Promise<SmartDevice[]>;
  createDevice(request: CreateDeviceRequest, token?: string): Promise<SmartDevice>;
  updateDeviceStatus(deviceId: string, request: UpdateDeviceStatusRequest, token?: string): Promise<SmartDevice>;
  getReports(range: ReportRange, token?: string): Promise<ReportPoint[]>;
}

function createMockId(value: string) {
  return `${value.trim().toLowerCase().replace(/[^a-z0-9]+/gi, "-") || "item"}-${Date.now()}`;
}

const mockHomes: SmartHomePlace[] = [
  { id: "casa", name: "Casa", location: "Hogar principal", favorite: true },
  { id: "oficina", name: "Oficina", location: "Espacio de trabajo", favorite: false },
];

const mockDevices: SmartDevice[] = [
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
    { label: "Abr", value: 126 },
    { label: "May", value: 114 },
    { label: "Jun", value: 98 },
  ],
};

const mockSmartHomeService: SmartHomeService = {
  async listHomes() {
    return mockHomes;
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
      mockHomes[index] = { ...mockHomes[index], favorite };
      return mockHomes[index];
    }

    throw new Error("Hogar no encontrado.");
  },

  async listDevices(homeId) {
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
      consumption: 0,
      yesterday: 0,
      online: true,
    };

    mockDevices.push(device);
    return device;
  },

  async updateDeviceStatus(deviceId, { online }) {
    const index = mockDevices.findIndex((device) => device.id === deviceId);

    if (index >= 0) {
      mockDevices[index] = { ...mockDevices[index], online };
      return mockDevices[index];
    }

    throw new Error("Dispositivo no encontrado.");
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
    return apiClient.post<SmartHomePlace, CreateHomeRequest>("/homes", request, { token });
  },

  toggleHomeFavorite(homeId, favorite, token) {
    return apiClient.patch<SmartHomePlace, { favorite: boolean }>(`/homes/${homeId}/favorite`, { favorite }, { token });
  },

  listDevices(homeId, token) {
    return apiClient.get<SmartDevice[]>(`/homes/${homeId}/devices`, { token });
  },

  createDevice(request, token) {
    return apiClient.post<SmartDevice, CreateDeviceRequest>(`/homes/${request.homeId}/devices`, request, { token });
  },

  updateDeviceStatus(deviceId, request, token) {
    return apiClient.patch<SmartDevice, UpdateDeviceStatusRequest>(`/devices/${deviceId}/status`, request, { token });
  },

  getReports(range, token) {
    return apiClient.get<ReportPoint[]>(`/reports?range=${encodeURIComponent(range)}`, { token });
  },
};

export const smartHomeService: SmartHomeService = useMockApi ? mockSmartHomeService : backendSmartHomeService;
