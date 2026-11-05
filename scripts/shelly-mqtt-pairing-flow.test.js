// Tests locales del contrato backend/dispositivo; no usan red ni credenciales reales.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const sourcePath = path.join(__dirname, '../lib/pairing/shelly-mqtt-pairing-flow.ts');
const source = fs.readFileSync(sourcePath, 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const loaded = { exports: {} };
new Function('require', 'module', 'exports', compiled)(require, loaded, loaded.exports);
const { prepareAndEnableShellyMqtt, confirmAndCompleteShellyMqtt } = loaded.exports;

const operationId = '42d8c2da-4701-4faa-87ac-e279b3854de5';
const session = (status, completion = null) => ({
  sessionId: 'ddf2160b-b0fb-4f6f-9e6b-2c94fffa1fbc',
  homeId: 'ca9a6785-d5eb-4c41-9c67-6f631fc495f6',
  method: 'LAN', status,
  expiresAt: new Date(Date.now() + 60_000).toISOString(),
  identity: {
    manufacturerDeviceId: 'shelly1pmg4-aabbcc', modelCode: 'S4SW-001P16EU',
    generation: 4, firmwareVersion: 'test', reportedAt: null,
    verification: 'MOBILE_REPORTED_UNVERIFIED',
  },
  completion,
  failureCode: null,
});

function dependencies(overrides = {}) {
  const calls = [];
  let getSessionResult = session('WAITING_FOR_MQTT');
  let completeResult = session('COMPLETED', { deviceId: 'device-uuid', ready: true });
  const deps = {
    calls,
    async prepareMqtt() {
      calls.push('prepare');
      return {
        phase: 'PREPARED_DISABLED_ONLY', operationId,
        credentialsDelivered: false, mqttAuthenticated: false,
      };
    },
    async advanceToWaiting() {
      calls.push('advance-to-waiting');
      return session('WAITING_FOR_MQTT', { deviceId: null, ready: false });
    },
    async authorizeBootstrap(id) {
      calls.push(`bootstrap:${id}`);
      return { phase: 'PROVISIONING_AUTHORIZED', mqttAuthenticated: false };
    },
    async configureLocally(auth) {
      calls.push(`configure:${auth.phase}`);
      return {
        phase: 'CONFIGURED_LOCALLY_UNVERIFIED', restartRequired: true,
        mqttConnected: false, mqttAuthenticated: false,
      };
    },
    async enableMqtt(id) {
      calls.push(`enable:${id}`);
      return { phase: 'AWAITING_MQTT_AUTH', mqttAuthenticated: false };
    },
    async readLocalMqttStatus() {
      calls.push('local-status');
      return { connected: true };
    },
    async confirmMqtt(id) {
      calls.push(`confirm:${id}`);
      getSessionResult = session('CONNECTED');
      return {
        phase: 'MQTT_AUTH_PERSISTED_SESSION_CONNECTED', mqttAuthenticated: true,
      };
    },
    async getSession() {
      calls.push('get-session');
      return getSessionResult;
    },
    async completeSession() {
      calls.push('complete');
      return completeResult;
    },
    setGetSessionResult(value) { getSessionResult = value; },
    setCompleteResult(value) { completeResult = value; },
    ...overrides,
  };
  return deps;
}

test('prepara la sesión, configura localmente y habilita solo una vez', async () => {
  const deps = dependencies({
    async readLocalMqttStatus() {
      this.calls.push('local-status');
      return { connected: false };
    },
  });
  const result = await prepareAndEnableShellyMqtt(deps);

  assert.equal(result.phase, 'AWAITING_MQTT_CONNECTION');
  assert.equal(result.operationId, operationId);
  assert.equal(result.mqttConnected, false);
  assert.deepEqual(deps.calls, [
    'prepare', 'advance-to-waiting', `bootstrap:${operationId}`,
    'configure:PROVISIONING_AUTHORIZED', `enable:${operationId}`, 'local-status',
  ]);
});

test('reporta etapa exacta al detenerse antes de configurar credenciales', async () => {
  const stages = [];
  const deps = dependencies({
    async authorizeBootstrap() {
      this.calls.push('bootstrap');
      throw new Error('MQTT_BOOTSTRAP_SESSION_NOT_AUTHORIZED');
    },
  });
  await assert.rejects(
    prepareAndEnableShellyMqtt(deps, { onStage: stage => stages.push(stage) }),
    /MQTT_BOOTSTRAP_SESSION_NOT_AUTHORIZED/,
  );
  assert.deepEqual(stages, [
    'PREPARING_BROKER_IDENTITY', 'ADVANCING_PAIRING_SESSION', 'AUTHORIZING_BOOTSTRAP',
  ]);
  assert.equal(deps.calls.includes('configure:PROVISIONING_AUTHORIZED'), false);
  assert.equal(deps.calls.some(call => call.startsWith('enable:')), false);
});

test('confirma el broker y solo entonces ejecuta el complete final', async () => {
  const deps = dependencies();
  const result = await confirmAndCompleteShellyMqtt({ operationId }, deps);

  assert.equal(result.phase, 'COMPLETED');
  assert.equal(result.session.completion.deviceId, 'device-uuid');
  assert.deepEqual(deps.calls, [
    'get-session', 'local-status', `confirm:${operationId}`,
    'get-session', 'complete',
  ]);
});

test('no confirma ni completa cuando MQTT.GetStatus sigue desconectado', async () => {
  const deps = dependencies({
    async readLocalMqttStatus() {
      this.calls.push('local-status');
      return { connected: false };
    },
  });
  const result = await confirmAndCompleteShellyMqtt({ operationId }, deps);

  assert.equal(result.phase, 'AWAITING_MQTT_CONNECTION');
  assert.deepEqual(deps.calls, ['get-session', 'local-status']);
});

test('reconoce COMPLETED si el backend terminó entre la consulta y confirm', async () => {
  const deps = dependencies({
    async confirmMqtt(id) {
      this.calls.push(`confirm:${id}`);
      this.setGetSessionResult(session('COMPLETED', { deviceId: 'device-uuid', ready: true }));
      return { phase: 'PAIRING_ALREADY_COMPLETED', mqttAuthenticated: true, alreadyConfirmed: true };
    },
  });
  const result = await confirmAndCompleteShellyMqtt({ operationId }, deps);

  assert.equal(result.phase, 'COMPLETED');
  assert.equal(result.session.completion.deviceId, 'device-uuid');
  assert.equal(deps.calls.includes('complete'), false);
});

test('no llama a complete si el backend no persistió CONNECTED', async () => {
  const deps = dependencies({
    async getSession() {
      this.calls.push('get-session');
      return this.calls.filter((call) => call === 'get-session').length === 1
        ? session('WAITING_FOR_MQTT')
        : session('WAITING_FOR_MQTT');
    },
  });
  await assert.rejects(
    confirmAndCompleteShellyMqtt({ operationId }, deps),
    /BACKEND_AUTH_STATE_UNCONFIRMED/,
  );
  assert.equal(deps.calls.includes('complete'), false);
});

test('no repite confirmación ante una respuesta incierta', async () => {
  const deps = dependencies({
    async confirmMqtt() {
      this.calls.push('confirm');
      throw new Error('MQTT_AUTH_OUTCOME_REQUIRES_RECONCILIATION');
    },
  });
  await assert.rejects(
    confirmAndCompleteShellyMqtt({ operationId }, deps),
    /RECONCILIATION/,
  );
  assert.equal(deps.calls.filter((call) => call === 'confirm').length, 1);
  assert.equal(deps.calls.includes('complete'), false);
});
