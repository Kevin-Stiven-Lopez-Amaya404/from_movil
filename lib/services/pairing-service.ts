
import * as Crypto from "expo-crypto";
import { apiConfig } from "@/lib/config/api-config";
import type { ShellyMqttBootstrapAuthorization } from "@/lib/pairing/shelly-mqtt-local-provisioning";

import { apiClient } from "@/lib/api/api-client";
import type { PairingSession } from "@/lib/pairing/pairing-types";
import type { ShellyLocalIdentity } from "@/lib/pairing/shelly-local-identity";

const DEVICE_MQTT_BROKER_HOST = "mqtt-dev.179-236-82-122.sslip.io";
const DEVICE_MQTT_BROKER_PORT = 443;
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type ShellyMqttConfirmation =
  | {
      phase: "MQTT_AUTH_PERSISTED_SESSION_CONNECTED";
      mqttAuthenticated: true;
      alreadyConfirmed?: true;
    }
  | {
      phase: "PAIRING_ALREADY_COMPLETED";
      mqttAuthenticated: true;
      alreadyConfirmed: true;
    };

export type ActivePairingSession = {
  session: PairingSession;
  sessionToken: string;
};

type CreateSessionRequest = {
  requestId: string;
  sessionToken: string;
  method: "LAN";
};

type IdentifySessionRequest = {
  manufacturerDeviceId: string;
  modelCode: string;
  generation: number;
  firmwareVersion?: string;
};

function pairingBasePath(homeId: string): string {
  return `/api/v1/homes/${encodeURIComponent(homeId)}/shelly/setup-sessions`;
}

function pairingSessionPath(
  homeId: string,
  sessionId: string,
): string {
  return `${pairingBasePath(homeId)}/${encodeURIComponent(sessionId)}`;
}

/**
 * Genera 32 bytes aleatorios mediante una fuente
 * criptográficamente segura.
 *
 * Se codifican como 64 caracteres hexadecimales,
 * compatibles con el contrato del backend.
 */
function generateSessionToken(): string {
  const bytes = Crypto.getRandomBytes(32);

  return Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

function pairingHeaders(sessionToken: string) {
  return {
    "X-Pairing-Token": sessionToken,
  };
}

export const pairingService = {
  /**
   * Crea una sesión LAN temporal.
   *
   * El token permanece en memoria del llamador.
   * No debe almacenarse en registros de diagnóstico.
   */
  createAttempt(): CreateSessionRequest {
    return {
      requestId: Crypto.randomUUID(),
      sessionToken: generateSessionToken(),
      method: "LAN",
    };
  },

  async createSession(
    homeId: string,
    attempt: CreateSessionRequest,
  ): Promise<ActivePairingSession> {
    const { sessionToken } = attempt;

    const body: CreateSessionRequest = attempt;

    const session = await apiClient.post<
      PairingSession,
      CreateSessionRequest
    >(
      pairingBasePath(homeId),
      body,
    );

    return {
      session,
      sessionToken,
    };
  },

  /**
   * Consulta el estado de una sesión existente.
   */
  async getSession(
    homeId: string,
    sessionId: string,
    sessionToken: string,
  ): Promise<PairingSession> {
    return apiClient.get<PairingSession>(
      pairingSessionPath(homeId, sessionId),
      {
        headers: pairingHeaders(sessionToken),
      },
    );
  },

  /**
   * Reporta al backend la identidad obtenida
   * directamente del Shelly por la red local.
   *
   * Esto NO confirma posesión ni conexión MQTT.
   */
  async identifyDevice(
    homeId: string,
    sessionId: string,
    sessionToken: string,
    identity: ShellyLocalIdentity,
  ): Promise<PairingSession> {
    const body: IdentifySessionRequest = {
      manufacturerDeviceId: identity.manufacturerDeviceId,
      modelCode: identity.modelCode,
      generation: identity.generation,
      ...(identity.firmwareVersion
        ? { firmwareVersion: identity.firmwareVersion }
        : {}),
    };

    return apiClient.post<
      PairingSession,
      IdentifySessionRequest
    >(
      `${pairingSessionPath(homeId, sessionId)}/identify`,
      body,
      {
        headers: pairingHeaders(sessionToken),
      },
    );
  },

  /**
   * Registro definitivo. El backend solo confirma el alta si ha observado
   * una conexión MQTT autenticada y la sesión está en CONNECTED.
   * Nunca considerar una respuesta WAITING_FOR_MQTT como alta exitosa.
   */
  async completeSession(
    homeId: string,
    sessionId: string,
    sessionToken: string,
    name: string,
  ): Promise<PairingSession> {
    const normalizedName = name.trim();
    if (!normalizedName || normalizedName.length > 100) {
      throw new Error("El nombre del dispositivo debe tener entre 1 y 100 caracteres.");
    }
    return apiClient.post<PairingSession, { name: string }>(
      `${pairingSessionPath(homeId, sessionId)}/complete`,
      { name: normalizedName },
      { headers: pairingHeaders(sessionToken) },
    );
  },


  /** Prepara una identidad DESHABILITADA, devuelve solo el UUID de operacion. */
  async prepareMqtt(
    homeId: string,
    sessionId: string,
    sessionToken: string,
  ): Promise<{
    phase: 'PREPARED_DISABLED_ONLY';
    operationId: string;
    credentialsDelivered: false;
    mqttAuthenticated: false;
  }> {
    const result = await apiClient.post<
      {
        phase: 'PREPARED_DISABLED_ONLY';
        operationId: string;
        credentialsDelivered: false;
        mqttAuthenticated: false;
      },
      Record<string, never>
    >(
      `${pairingSessionPath(homeId, sessionId)}/mqtt/prepare`,
      {},
      {headers: pairingHeaders(sessionToken)},
    );
    if (result.phase !== 'PREPARED_DISABLED_ONLY' ||
        !UUID_V4.test(result.operationId) ||
        result.credentialsDelivered !== false ||
        result.mqttAuthenticated !== false) {
      throw new Error('MQTT_PREPARE_RESULT_UNCERTAIN');
    }
    return result;
  },

  /**
   * SOLO build de desarrollo, laboratorio autorizado y API HTTPS válida.
   * Retorna contraseña individual temporalmente en memoria; no registrar ni almacenar.
   */
  async authorizeMqttBootstrap(
    homeId: string,
    sessionId: string,
    sessionToken: string,
    operationId: string,
  ): Promise<ShellyMqttBootstrapAuthorization> {
    if (!__DEV__ || !apiConfig.baseUrl.startsWith('https://')) {
      throw new Error('MQTT_BOOTSTRAP_REQUIRES_HTTPS_BACKEND_DEV');
    }
    const result = await apiClient.post<
      ShellyMqttBootstrapAuthorization,
      {operationId: string}
    >(
      `${pairingSessionPath(homeId, sessionId)}/mqtt/bootstrap`,
      {operationId},
      {headers: {
        ...pairingHeaders(sessionToken),
        'Cache-Control': 'no-store',
      }},
    );
    const expiresAt = Date.parse(result.expiresAt);
    if (result.phase !== 'PROVISIONING_AUTHORIZED' ||
        result.mqttAuthenticated !== false ||
        !UUID_V4.test(operationId) ||
        !result.identity || !result.broker ||
        result.broker.hostname !== DEVICE_MQTT_BROKER_HOST ||
        result.broker.port !== DEVICE_MQTT_BROKER_PORT ||
        !Number.isFinite(expiresAt) || expiresAt <= Date.now() ||
        expiresAt - Date.now() > 120_000) {
      throw new Error('MQTT_BOOTSTRAP_RESULT_UNCERTAIN');
    }
    return result;
  },

  /** Habilita la cuenta MQTT, pero NO marca autenticacion ni equipo registrado. */
  async enablePreparedMqtt(
    homeId: string, sessionId: string, sessionToken: string, operationId: string,
  ): Promise<{phase: 'AWAITING_MQTT_AUTH'; mqttAuthenticated: false}> {
    if (!__DEV__ || !apiConfig.baseUrl.startsWith('https://')) {
      throw new Error('MQTT_ENABLE_REQUIRES_HTTPS_BACKEND_DEV');
    }
    const result = await apiClient.post<
      {phase: 'AWAITING_MQTT_AUTH'; mqttAuthenticated: false},
      {operationId: string}
    >(
      `${pairingSessionPath(homeId, sessionId)}/mqtt/enable`,
      {operationId},
      {headers: {
        ...pairingHeaders(sessionToken),
        'Cache-Control': 'no-store',
      }},
    );
    if (result.phase !== 'AWAITING_MQTT_AUTH' || result.mqttAuthenticated !== false) {
      throw new Error('MQTT_ENABLE_RESULT_UNCERTAIN');
    }
    return result;
  },

  /** Solo el backend puede confirmar CONNECTED tras el desafío del broker. */
  async confirmMqttAuthentication(
    homeId: string,
    sessionId: string,
    sessionToken: string,
    operationId: string,
  ): Promise<ShellyMqttConfirmation> {
    if (!__DEV__ || !apiConfig.baseUrl.startsWith('https://')) {
      throw new Error('MQTT_CONFIRM_REQUIRES_HTTPS_BACKEND_DEV');
    }
    if (!UUID_V4.test(operationId)) {
      throw new Error('MQTT_CONFIRM_OPERATION_INVALID');
    }
    const result = await apiClient.post<ShellyMqttConfirmation, {operationId: string}>(
      `${pairingSessionPath(homeId, sessionId)}/mqtt/confirm`,
      {operationId},
      {headers: {
        ...pairingHeaders(sessionToken),
        'Cache-Control': 'no-store',
      }},
    );
    if (result.mqttAuthenticated !== true ||
        !['MQTT_AUTH_PERSISTED_SESSION_CONNECTED', 'PAIRING_ALREADY_COMPLETED']
          .includes(result.phase)) {
      throw new Error('MQTT_CONFIRM_OUTCOME_UNCERTAIN');
    }
    return result;
  },

  /**
   * Cancela una sesión de pairing activa.
   */
  async cancelSession(
    homeId: string,
    sessionId: string,
    sessionToken: string,
  ): Promise<PairingSession> {
    return apiClient.delete<PairingSession>(
      pairingSessionPath(homeId, sessionId),
      {
        headers: pairingHeaders(sessionToken),
      },
    );
  },
};
