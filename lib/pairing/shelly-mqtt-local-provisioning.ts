/**
 * SmartHome 504.13 - transporte LAN del APROVISIONAMIENTO MQTT Shelly Gen4.
 * No solicita credenciales al usuario, no crea identidades, no habilita el
 * broker y JAMAS marca una sesion CONNECTED o COMPLETED.
 *
 * Solo puede invocarse tras una autorizacion corta del backend (aun pendiente).
 * La RPC HTTP LAN no ofrece confidencialidad de transporte: requiere una red
 * aislada/confiable o un canal local protegido antes del uso en produccion.
 */
import { isPrivateIpv4, readShellyLocalIdentity } from './shelly-local-identity';

export interface ShellyMqttBootstrapAuthorization {
  readonly phase: 'PROVISIONING_AUTHORIZED';
  readonly mqttAuthenticated: false;
  readonly manufacturerDeviceId: string;
  readonly expiresAt: string;
  readonly broker: {
    readonly hostname: string;
    readonly port: number;
    readonly caPem: string;
  };
  readonly identity: {
    readonly username: string;
    readonly password: string;
    readonly clientId: string;
    readonly topicPrefix: string;
  };
}

export interface ShellyRpcTransport {
  (ip: string, method: string, params: Record<string, unknown>, signal?: AbortSignal): Promise<unknown>;
}

export interface ShellyMqttLocalProvisioningResult {
  readonly phase: 'CONFIGURED_LOCALLY_UNVERIFIED';
  readonly restartRequired: boolean;
  readonly mqttConnected: boolean;
  readonly mqttAuthenticated: false;
}

const ID = /^shelly1pmg4-[a-f0-9]+$/i;
const MQTT_USER = /^shd_[a-f0-9]{32}$/;
const MQTT_CLIENT = /^shd-[a-f0-9]{32}$/;
const TOPIC = /^[A-Za-z0-9_.:-]+(?:\/[A-Za-z0-9_.:-]+)*$/;
const HOSTNAME = /^(?:[A-Za-z0-9-]+\.)*[A-Za-z0-9-]+$/;
const VPS_BROKER_HOST = 'mqtt-dev.179-236-82-122.sslip.io';
const VPS_BROKER_PORT = 443;
const RPC_TIMEOUT_MS = 8000;
const REBOOT_READ_ATTEMPTS = 15;
const REBOOT_READ_INTERVAL_MS = 1000;

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>) : null;
}

function assertValid(
  ip: string,
  expectedDeviceId: string,
  auth: ShellyMqttBootstrapAuthorization,
  explicitlyTrustedLocalNetwork: boolean,
): void {
  if (!explicitlyTrustedLocalNetwork) {
    throw new Error('SHELLY_LOCAL_PROVISIONING_TRUST_REQUIRED');
  }
  if (!isPrivateIpv4(ip) || !ID.test(expectedDeviceId)) {
    throw new Error('SHELLY_PROVISIONING_TARGET_INVALID');
  }
  if (!auth || auth.phase !== 'PROVISIONING_AUTHORIZED' ||
      auth.mqttAuthenticated !== false ||
      auth.manufacturerDeviceId !== expectedDeviceId ||
      !auth.expiresAt || !Number.isFinite(Date.parse(auth.expiresAt)) ||
      Date.parse(auth.expiresAt) <= Date.now() ||
      Date.parse(auth.expiresAt) - Date.now() > 5 * 60_000) {
    throw new Error('SHELLY_PROVISIONING_AUTHORIZATION_INVALID');
  }
  const { hostname, port, caPem } = auth.broker ?? {};
  if (hostname !== VPS_BROKER_HOST || port !== VPS_BROKER_PORT ||
      typeof hostname !== 'string' || hostname.length > 253 ||
      !HOSTNAME.test(hostname) || typeof port !== 'number' || !Number.isInteger(port) ||
      port < 1 || port > 65535 || typeof caPem !== 'string' ||
      caPem.length < 100 || caPem.length > 16_384 ||
      !/^-----BEGIN CERTIFICATE-----\r?\n[\s\S]+?-----END CERTIFICATE-----\s*$/.test(caPem) ||
      /PRIVATE KEY|\x00/.test(caPem)) {
    throw new Error('SHELLY_PROVISIONING_BROKER_INVALID');
  }
  const identity = auth.identity;
  if (!identity || !MQTT_USER.test(identity.username) ||
      !MQTT_CLIENT.test(identity.clientId) ||
      identity.username.slice(4) !== identity.clientId.slice(4) ||
      typeof identity.password !== 'string' ||
      !/^[A-Za-z0-9_-]{43}$/.test(identity.password) ||
      typeof identity.topicPrefix !== 'string' ||
      !TOPIC.test(identity.topicPrefix) ||
      !(identity.topicPrefix === expectedDeviceId ||
        identity.topicPrefix.endsWith(`/devices/${expectedDeviceId}`))) {
    throw new Error('SHELLY_PROVISIONING_IDENTITY_INVALID');
  }
}

/**
 * HTTP en el dispositivo. No incluir credenciales en URL, query string,
 * logs, mensajes de error ni almacenamiento persistente del telefono.
 */
export const defaultShellyRpcTransport: ShellyRpcTransport = async (
  ip, method, params, signal,
) => {
  if (!isPrivateIpv4(ip) ||
      !/^(Shelly\.Reboot|MQTT\.SetConfig|MQTT\.GetConfig|MQTT\.GetStatus)$/.test(method)) {
    throw new Error('SHELLY_LOCAL_RPC_NOT_ALLOWED');
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), RPC_TIMEOUT_MS);
  const forwardAbort = () => controller.abort();
  signal?.addEventListener('abort', forwardAbort, { once: true });
  try {
    if (signal?.aborted) throw new Error('SHELLY_RPC_ABORTED');
    const response = await fetch(`http://${ip}/rpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ id: 1, method, params }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error('SHELLY_RPC_HTTP_FAILED');
    const reply: unknown = await response.json();
    const obj = record(reply);
    if (!obj || obj.id !== 1 || obj.error !== undefined || !('result' in obj)) {
      throw new Error('SHELLY_RPC_RESPONSE_INVALID');
    }
    return obj.result;
  } catch {
    // La respuesta del dispositivo podria incluir detalles sensibles.
    throw new Error('SHELLY_RPC_OUTCOME_UNCERTAIN');
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', forwardAbort);
  }
};

function assertMqttConfigMatches(
  value: unknown,
  authorization: ShellyMqttBootstrapAuthorization,
): void {
  const config = record(value);
  const { broker, identity } = authorization;
  if (!config || config.enable !== true ||
      config.server !== `${broker.hostname}:${broker.port}` ||
      config.client_id !== identity.clientId || config.user !== identity.username ||
      config.ssl_ca !== 'ca.pem' || config.use_client_cert !== false ||
      config.topic_prefix !== identity.topicPrefix) {
    throw new Error('SHELLY_PROVISIONING_CONFIG_READBACK_MISMATCH');
  }
}

async function readConfiguredMqttState(
  ip: string,
  authorization: ShellyMqttBootstrapAuthorization,
  rpc: ShellyRpcTransport,
  signal?: AbortSignal,
): Promise<{ mqttConnected: boolean }> {
  assertMqttConfigMatches(
    await rpc(ip, 'MQTT.GetConfig', {}, signal), authorization,
  );
  const status = record(await rpc(ip, 'MQTT.GetStatus', {}, signal));
  if (!status || typeof status.connected !== 'boolean') {
    throw new Error('SHELLY_PROVISIONING_STATUS_READBACK_INVALID');
  }
  return { mqttConnected: status.connected };
}

function waitForRetry(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error('SHELLY_PROVISIONING_ABORTED'));
      return;
    }
    const timeout = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timeout);
      reject(new Error('SHELLY_PROVISIONING_ABORTED'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

async function readAfterReboot(
  ip: string,
  authorization: ShellyMqttBootstrapAuthorization,
  rpc: ShellyRpcTransport,
  wait: (ms: number, signal?: AbortSignal) => Promise<void>,
  signal?: AbortSignal,
): Promise<{ mqttConnected: boolean }> {
  for (let attempt = 0; attempt < REBOOT_READ_ATTEMPTS; attempt += 1) {
    if (signal?.aborted) throw new Error('SHELLY_PROVISIONING_ABORTED');
    try {
      return await readConfiguredMqttState(ip, authorization, rpc, signal);
    } catch (error) {
      if (!(error instanceof Error) ||
          error.message !== 'SHELLY_RPC_OUTCOME_UNCERTAIN') {
        throw error;
      }
      if (attempt + 1 < REBOOT_READ_ATTEMPTS) {
        await wait(REBOOT_READ_INTERVAL_MS, signal);
      }
    }
  }
  throw new Error('SHELLY_REBOOT_REQUIRES_RECONCILIATION');
}

/** Read-only local MQTT status check; never implies backend authentication. */
export async function readShellyMqttStatus(
  input: {
    readonly ip: string;
    readonly expectedDeviceId: string;
    readonly signal?: AbortSignal;
  },
  rpc: ShellyRpcTransport = defaultShellyRpcTransport,
): Promise<{ readonly connected: boolean }> {
  if (!isPrivateIpv4(input.ip) || !ID.test(input.expectedDeviceId)) {
    throw new Error('SHELLY_PROVISIONING_TARGET_INVALID');
  }
  const identity = await readShellyLocalIdentity(input.ip, input.signal);
  if (identity.manufacturerDeviceId !== input.expectedDeviceId) {
    throw new Error('SHELLY_PROVISIONING_PHYSICAL_ID_CHANGED');
  }
  const status = record(await rpc(input.ip, 'MQTT.GetStatus', {}, input.signal));
  if (!status || typeof status.connected !== 'boolean') {
    throw new Error('SHELLY_PROVISIONING_STATUS_READBACK_INVALID');
  }
  return { connected: status.connected };
}

/**
 * Configura MQTT localmente, aplica el reinicio solicitado por Shelly y
 * comprueba la configuración/estado. El estado local nunca acredita al backend.
 */
export async function configureShellyMqttLocally(
  input: {
    readonly ip: string;
    readonly expectedDeviceId: string;
    readonly authorization: ShellyMqttBootstrapAuthorization;
    readonly explicitlyTrustedLocalNetwork: boolean;
    readonly signal?: AbortSignal;
  },
  rpc: ShellyRpcTransport = defaultShellyRpcTransport,
  wait: (ms: number, signal?: AbortSignal) => Promise<void> = waitForRetry,
): Promise<ShellyMqttLocalProvisioningResult> {
  const { ip, expectedDeviceId, authorization, signal } = input;
  assertValid(ip, expectedDeviceId, authorization, input.explicitlyTrustedLocalNetwork);
  const before = await readShellyLocalIdentity(ip, signal);
  if (before.manufacturerDeviceId !== expectedDeviceId) {
    throw new Error('SHELLY_PROVISIONING_PHYSICAL_ID_CHANGED');
  }
  if (signal?.aborted) throw new Error('SHELLY_PROVISIONING_ABORTED');

  // El endpoint público mqtt-dev termina TLS en Traefik con Let's Encrypt.
  // El paquete broker.caPem corresponde a la CA INTERNA (Traefik -> Mosquitto)
  // y NO debe instalarse en Shelly ni usarse como confianza del broker público.
  // Usar el almacén público de Shelly (ca.pem), validado físicamente contra HTTPS.
  // No sobrescribir user_ca.pem ni realizar escrituras adicionales de certificados.
  if (Date.parse(authorization.expiresAt) <= Date.now()) {
    throw new Error('SHELLY_PROVISIONING_AUTHORIZATION_EXPIRED');
  }
  const mqtt = authorization.identity;
  const result = record(await rpc(ip, 'MQTT.SetConfig', {
    config: {
      enable: true,
      server: `${authorization.broker.hostname}:${authorization.broker.port}`,
      client_id: mqtt.clientId,
      user: mqtt.username,
      pass: mqtt.password,
      ssl_ca: 'ca.pem',
      use_client_cert: false,
      topic_prefix: mqtt.topicPrefix,
      enable_rpc: true,
      rpc_ntf: true,
      status_ntf: true,
    },
  }, signal));
  if (!result || typeof result.restart_required !== 'boolean') {
    throw new Error('SHELLY_PROVISIONING_SET_CONFIG_UNCERTAIN');
  }

  assertMqttConfigMatches(
    await rpc(ip, 'MQTT.GetConfig', {}, signal), authorization,
  );

  let mqttConnected: boolean;
  if (result.restart_required) {
    if (signal?.aborted) throw new Error('SHELLY_PROVISIONING_ABORTED');
    const rebootResult = await rpc(ip, 'Shelly.Reboot', {}, signal);
    if (rebootResult !== null) {
      throw new Error('SHELLY_PROVISIONING_REBOOT_OUTCOME_UNCERTAIN');
    }
    ({ mqttConnected } = await readAfterReboot(
      ip, authorization, rpc, wait, signal,
    ));
  } else {
    const status = record(await rpc(ip, 'MQTT.GetStatus', {}, signal));
    if (!status || typeof status.connected !== 'boolean') {
      throw new Error('SHELLY_PROVISIONING_STATUS_READBACK_INVALID');
    }
    mqttConnected = status.connected;
  }
  // Deliberadamente no verificar 'pass' por RPC ni devolverla al llamador.
  return {
    phase: 'CONFIGURED_LOCALLY_UNVERIFIED',
    restartRequired: result.restart_required,
    mqttConnected,
    mqttAuthenticated: false,
  };
}
