import type { PairingSession } from './pairing-types';
import type {
  ShellyMqttBootstrapAuthorization,
  ShellyMqttLocalProvisioningResult,
} from './shelly-mqtt-local-provisioning';
import type { ShellyMqttConfirmation } from '@/lib/services/pairing-service';

export interface ShellyMqttPairingDependencies {
  prepareMqtt(): Promise<{
    phase: 'PREPARED_DISABLED_ONLY';
    operationId: string;
    credentialsDelivered: false;
    mqttAuthenticated: false;
  }>;
  /** /complete advances DEVICE_IDENTIFIED to WAITING_FOR_MQTT when not ready. */
  advanceToWaiting(): Promise<PairingSession>;
  authorizeBootstrap(operationId: string): Promise<ShellyMqttBootstrapAuthorization>;
  configureLocally(
    authorization: ShellyMqttBootstrapAuthorization,
  ): Promise<ShellyMqttLocalProvisioningResult>;
  enableMqtt(operationId: string): Promise<{
    phase: 'AWAITING_MQTT_AUTH';
    mqttAuthenticated: false;
  }>;
  readLocalMqttStatus(): Promise<{ readonly connected: boolean }>;
  confirmMqtt(operationId: string): Promise<ShellyMqttConfirmation>;
  getSession(): Promise<PairingSession>;
  completeSession(): Promise<PairingSession>;
}

export type ShellyMqttPairingProgress = {
  readonly phase: 'AWAITING_MQTT_CONNECTION' | 'READY_FOR_MQTT_CONFIRM';
  readonly operationId: string;
  readonly restartRequired: boolean;
  readonly mqttConnected: boolean;
};

export type ShellyMqttPairingComplete = {
  readonly phase: 'COMPLETED';
  readonly session: PairingSession;
};

export interface ShellyMqttPairingProgressCallbacks {
  onPrepared?(operationId: string): void;
  onLocalConfigurationVerified?(result: ShellyMqttLocalProvisioningResult): void;
}

/**
 * Runs only one pass through mutating requests. If a response is uncertain,
 * callers must reconcile with GETs; this function never retries a write.
 */
export async function prepareAndEnableShellyMqtt(
  dependencies: ShellyMqttPairingDependencies,
  progress?: ShellyMqttPairingProgressCallbacks,
): Promise<ShellyMqttPairingProgress> {
  const prepared = await dependencies.prepareMqtt();
  if (prepared.phase !== 'PREPARED_DISABLED_ONLY' ||
      !prepared.operationId || prepared.credentialsDelivered !== false ||
      prepared.mqttAuthenticated !== false) {
    throw new Error('MQTT_PREPARE_RESULT_UNCERTAIN');
  }
  progress?.onPrepared?.(prepared.operationId);

  // Backend's /complete has a non-final transition to WAITING_FOR_MQTT.
  // This call cannot register the device; ready must remain false here.
  const waiting = await dependencies.advanceToWaiting();
  if (waiting.status !== 'WAITING_FOR_MQTT' ||
      waiting.completion?.ready !== false) {
    throw new Error('MQTT_WAITING_STATE_UNCONFIRMED');
  }

  let authorization: ShellyMqttBootstrapAuthorization | null =
    await dependencies.authorizeBootstrap(prepared.operationId);
  if (authorization.mqttAuthenticated !== false) {
    authorization = null;
    throw new Error('MQTT_BOOTSTRAP_RESULT_UNCERTAIN');
  }

  const local = await dependencies.configureLocally(authorization);
  authorization = null;
  if (local.phase !== 'CONFIGURED_LOCALLY_UNVERIFIED' ||
      local.mqttAuthenticated !== false) {
    throw new Error('MQTT_LOCAL_CONFIG_UNCERTAIN');
  }
  progress?.onLocalConfigurationVerified?.(local);

  const enabled = await dependencies.enableMqtt(prepared.operationId);
  if (enabled.phase !== 'AWAITING_MQTT_AUTH' ||
      enabled.mqttAuthenticated !== false) {
    throw new Error('MQTT_ENABLE_OUTCOME_UNCERTAIN');
  }

  const status = await dependencies.readLocalMqttStatus();
  return {
    phase: status.connected
      ? 'READY_FOR_MQTT_CONFIRM'
      : 'AWAITING_MQTT_CONNECTION',
    operationId: prepared.operationId,
    restartRequired: local.restartRequired,
    mqttConnected: status.connected,
  };
}

/**
 * Confirms authentication only after local MQTT status says connected, then
 * requires backend CONNECTED before the final /complete registration call.
 */
export async function confirmAndCompleteShellyMqtt(
  input: { readonly operationId: string },
  dependencies: ShellyMqttPairingDependencies,
): Promise<ShellyMqttPairingProgress | ShellyMqttPairingComplete> {
  let session = await dependencies.getSession();
  if (session.status === 'COMPLETED') {
    if (!session.completion?.deviceId) {
      throw new Error('MQTT_COMPLETION_STATE_UNCERTAIN');
    }
    return { phase: 'COMPLETED', session };
  }

  if (session.status === 'WAITING_FOR_MQTT') {
    const localStatus = await dependencies.readLocalMqttStatus();
    if (!localStatus.connected) {
      return {
        phase: 'AWAITING_MQTT_CONNECTION',
        operationId: input.operationId,
        restartRequired: false,
        mqttConnected: false,
      };
    }

    const confirmation = await dependencies.confirmMqtt(input.operationId);
    if (confirmation.mqttAuthenticated !== true) {
      throw new Error('MQTT_CONFIRM_OUTCOME_UNCERTAIN');
    }
    session = await dependencies.getSession();
  }

  if (session.status === 'COMPLETED') {
    if (!session.completion?.deviceId) {
      throw new Error('MQTT_COMPLETION_STATE_UNCERTAIN');
    }
    return { phase: 'COMPLETED', session };
  }

  if (session.status !== 'CONNECTED') {
    throw new Error('MQTT_BACKEND_AUTH_STATE_UNCONFIRMED');
  }

  const completed = await dependencies.completeSession();
  if (completed.status !== 'COMPLETED' || !completed.completion?.deviceId) {
    throw new Error('MQTT_COMPLETION_OUTCOME_UNCERTAIN');
  }
  return { phase: 'COMPLETED', session: completed };
}
