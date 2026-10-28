import { apiClient } from "@/lib/api/api-client";
import { apiConfig } from "@/lib/config/api-config";
import { PairingError } from "@/lib/pairing/pairing-types";

/**
 * Contrato de sesiones HU16 + provisión MQTT VPS DEV.
 * El llamador genera requestId (UUID) y sessionToken criptográficamente seguro
 * (43..128 caracteres base64url); el servicio no persiste ni registra secretos.
 * No convertir respuestas 202 en éxito de vinculación.
 */
export type ShellyPairingMethod = "LAN" | "AP";
export type ShellyPairingStatus =
  | "PENDING" | "DEVICE_IDENTIFIED" | "WAITING_FOR_MQTT"
  | "CONNECTED" | "COMPLETED" | "EXPIRED" | "CANCELLED" | "FAILED";

export type ShellyPairingSession = {
  sessionId: string;
  homeId: string;
  method: ShellyPairingMethod;
  status: ShellyPairingStatus;
  expiresAt: string;
  identity: null | {
    manufacturerDeviceId: string;
    modelCode: string;
    generation: number;
    firmwareVersion: string | null;
    reportedAt: string;
    verification: string;
  };
  completion: null | { deviceId: string };
  failureCode: string | null;
};

export type ShellyMqttPreparation = {
  phase: "PREPARED_DISABLED_ONLY";
  operationId: string;
  credentialsDelivered: false;
  mqttAuthenticated: false;
};

/** Contiene credenciales efímeras: consumir solo en memoria y nunca registrar. */
export type ShellyMqttBootstrap = {
  [key: string]: unknown;
  manufacturerDeviceId: string;
  expiresAt: string;
};

export type ShellyPairingIdentity = {
  manufacturerDeviceId: string;
  generation: number;
  modelCode: string;
  firmwareVersion?: string;
};

function sessions(homeId: string): string {
  return `/api/v1/homes/${encodeURIComponent(homeId)}/shelly/setup-sessions`;
}

function sessionPath(homeId: string, sessionId: string): string {
  return `${sessions(homeId)}/${encodeURIComponent(sessionId)}`;
}

function headers(sessionToken: string) {
  if (!/^[A-Za-z0-9_-]{43,128}$/.test(sessionToken)) {
    throw new PairingError("Token de vinculación inválido.", "INVALID_STATE");
  }
  return { "X-Pairing-Token": sessionToken };
}

function requireApi() {
  if (!apiConfig.baseUrl) {
    throw new PairingError("La vinculación requiere conexión con el backend.", "PAIRING_UNSUPPORTED");
  }
}

export const pairingService = {
  /** Crear la sesión: el servidor conserva únicamente el hash del token. */
  async createSession(homeId: string, request: {
    requestId: string;
    sessionToken: string;
    method: ShellyPairingMethod;
  }): Promise<ShellyPairingSession> {
    requireApi();
    headers(request.sessionToken);
    return apiClient.post<ShellyPairingSession>(sessions(homeId), request);
  },

  getSession(homeId: string, sessionId: string, sessionToken: string) {
    requireApi();
    return apiClient.get<ShellyPairingSession>(sessionPath(homeId, sessionId), {
      headers: headers(sessionToken),
    });
  },

  identify(homeId: string, sessionId: string, sessionToken: string, identity: ShellyPairingIdentity) {
    requireApi();
    return apiClient.post<ShellyPairingSession>(
      `${sessionPath(homeId, sessionId)}/identify`, identity,
      { headers: headers(sessionToken) },
    );
  },

  prepareMqtt(homeId: string, sessionId: string, sessionToken: string) {
    requireApi();
    return apiClient.post<ShellyMqttPreparation>(
      `${sessionPath(homeId, sessionId)}/mqtt/prepare`, undefined,
      { headers: headers(sessionToken) },
    );
  },

  /** Entrega de uso breve: no guardar la respuesta en estado persistente. */
  bootstrapMqtt(homeId: string, sessionId: string, sessionToken: string, operationId: string) {
    requireApi();
    return apiClient.post<ShellyMqttBootstrap>(
      `${sessionPath(homeId, sessionId)}/mqtt/bootstrap`,
      { operationId }, { headers: headers(sessionToken) },
    );
  },

  enableMqtt(homeId: string, sessionId: string, sessionToken: string, operationId: string) {
    requireApi();
    return apiClient.post<unknown>(
      `${sessionPath(homeId, sessionId)}/mqtt/enable`,
      { operationId }, { headers: headers(sessionToken) },
    );
  },

  confirmMqtt(homeId: string, sessionId: string, sessionToken: string, operationId: string) {
    requireApi();
    return apiClient.post<unknown>(
      `${sessionPath(homeId, sessionId)}/mqtt/confirm`,
      { operationId }, { headers: headers(sessionToken) },
    );
  },

  complete(homeId: string, sessionId: string, sessionToken: string, name: string) {
    requireApi();
    return apiClient.post<ShellyPairingSession>(
      `${sessionPath(homeId, sessionId)}/complete`,
      { name }, { headers: headers(sessionToken) },
    );
  },

  cancel(homeId: string, sessionId: string, sessionToken: string) {
    requireApi();
    return apiClient.delete<ShellyPairingSession>(
      sessionPath(homeId, sessionId), { headers: headers(sessionToken) },
    );
  },
};
