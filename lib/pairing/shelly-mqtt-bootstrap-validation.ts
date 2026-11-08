/**
 * Validates the public bootstrap contract without logging or returning secrets.
 * The backend limits the TTL to 120 seconds (server time). The phone
 * may drift slightly from the server: allow 60 s for the
 * MAXIMUM check, without extending the real backend expiry.
 */
import type { ShellyMqttBootstrapAuthorization } from './shelly-mqtt-local-provisioning';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_BOOTSTRAP_SERVER_TTL_MS = 120_000;
const MAX_CLIENT_CLOCK_SKEW_MS = 60_000;

export function assertValidMqttBootstrapResponse(
  result: ShellyMqttBootstrapAuthorization,
  operationId: string,
  expectedBrokerHost: string,
  expectedBrokerPort: number,
  nowMs: number = Date.now(),
): void {
  if (!UUID_V4.test(operationId)) {
    throw new Error('MQTT_BOOTSTRAP_OPERATION_INVALID');
  }
  if (!result || result.phase !== 'PROVISIONING_AUTHORIZED' ||
      result.mqttAuthenticated !== false || !result.identity || !result.broker) {
    throw new Error('MQTT_BOOTSTRAP_ENVELOPE_INVALID');
  }
  if (result.broker.hostname !== expectedBrokerHost ||
      result.broker.port !== expectedBrokerPort) {
    throw new Error('MQTT_BOOTSTRAP_BROKER_MISMATCH');
  }
  const expiresAtMs = typeof result.expiresAt === 'string'
    ? Date.parse(result.expiresAt) : NaN;
  if (!Number.isFinite(expiresAtMs)) {
    throw new Error('MQTT_BOOTSTRAP_EXPIRES_AT_INVALID');
  }
  if (expiresAtMs <= nowMs) {
    throw new Error('MQTT_BOOTSTRAP_EXPIRED_OR_CLOCK_AHEAD');
  }
  if (expiresAtMs - nowMs > MAX_BOOTSTRAP_SERVER_TTL_MS + MAX_CLIENT_CLOCK_SKEW_MS) {
    throw new Error('MQTT_BOOTSTRAP_CLOCK_SKEW_OR_TTL_INVALID');
  }
}
