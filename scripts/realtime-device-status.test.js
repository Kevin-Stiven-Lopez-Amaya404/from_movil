
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

function loadExport(file, exportName) {
  const source = readFileSync(
    path.join(__dirname, "..", file),
    "utf8",
  );

  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });

  const sandbox = { exports: {} };

  vm.runInNewContext(outputText, sandbox, {
    filename: file,
  });

  return sandbox.exports[exportName];
}

const applyDeviceStatusEvent = loadExport(
  "lib/realtime/apply-device-status-event.ts",
  "applyDeviceStatusEvent",
);

const getActiveDeviceAlerts = loadExport(
  "lib/alerts/active-device-alerts.ts",
  "getActiveDeviceAlerts",
);

const homes = [{ id: "home-1", name: "Casa principal" }];
const loaded = { "home-1": "loaded" };

function makeDevice(id = "device-1") {
  return {
    id,
    homeId: "home-1",
    name: "Shelly cocina",
    category: "Iluminacion",
    icon: "bulb",
    power: 20,
    energy: 1000,
    voltage: 120,
    current: 0.2,
    frequency: 60,
    online: true,
    connectivityStatus: "ONLINE",
    state: "on",
    yesterday: 0,
  };
}

function alertCount(devices) {
  return getActiveDeviceAlerts(
    devices,
    homes,
    loaded,
  ).length;
}

test("El evento OFFLINE genera una alerta", () => {
  const devices = applyDeviceStatusEvent(
    [makeDevice()],
    {
      deviceId: "device-1",
      connectivityStatus: "OFFLINE",
    },
  );

  assert.equal(devices[0].connectivityStatus, "OFFLINE");
  assert.equal(devices[0].online, false);
  assert.equal(alertCount(devices), 1);
});

test("El evento ONLINE elimina la alerta", () => {
  const offline = applyDeviceStatusEvent(
    [makeDevice()],
    {
      deviceId: "device-1",
      connectivityStatus: "OFFLINE",
    },
  );

  const online = applyDeviceStatusEvent(offline, {
    deviceId: "device-1",
    connectivityStatus: "ONLINE",
  });

  assert.equal(alertCount(offline), 1);
  assert.equal(alertCount(online), 0);
  assert.equal(online[0].online, true);
});

test("UNKNOWN no genera una falsa desconexión", () => {
  const devices = applyDeviceStatusEvent(
    [makeDevice()],
    {
      deviceId: "device-1",
      connectivityStatus: "UNKNOWN",
    },
  );

  assert.equal(devices[0].online, false);
  assert.equal(devices[0].connectivityStatus, "UNKNOWN");
  assert.equal(alertCount(devices), 0);
});

test("Un evento sin identificador no modifica dispositivos", () => {
  const original = [makeDevice()];

  const result = applyDeviceStatusEvent(original, {
    connectivityStatus: "OFFLINE",
  });

  assert.strictEqual(result, original);
  assert.equal(alertCount(result), 0);
});

test("Un dispositivo desconocido no modifica la lista", () => {
  const original = [makeDevice()];

  const result = applyDeviceStatusEvent(original, {
    deviceId: "device-inexistente",
    connectivityStatus: "OFFLINE",
  });

  assert.strictEqual(result, original);
});

test("No modifica los demás dispositivos", () => {
  const first = makeDevice("device-1");
  const second = makeDevice("device-2");

  const result = applyDeviceStatusEvent(
    [first, second],
    {
      deviceId: "device-1",
      connectivityStatus: "OFFLINE",
    },
  );

  assert.equal(result[0].online, false);
  assert.strictEqual(result[1], second);
  assert.equal(result[1].online, true);
  assert.equal(alertCount(result), 1);
});

test("Actualiza telemetría y conserva conversiones", () => {
  const result = applyDeviceStatusEvent(
    [makeDevice()],
    {
      deviceId: "device-1",
      currentPowerW: 50,
      energyTotalKwh: 2.5,
      voltageV: 110,
      isOn: false,
      updatedAt: "2026-10-16T18:00:00Z",
    },
  );

  assert.equal(result[0].power, 50);
  assert.equal(result[0].energy, 2500);
  assert.equal(result[0].voltage, 110);
  assert.equal(result[0].state, "off");
  assert.equal(
    result[0].lastStateChange,
    "2026-10-16T18:00:00Z",
  );
});

test("Un evento sin conectividad conserva el estado previo", () => {
  const result = applyDeviceStatusEvent(
    [makeDevice()],
    {
      deviceId: "device-1",
      currentPowerW: 35,
    },
  );

  assert.equal(result[0].connectivityStatus, "ONLINE");
  assert.equal(result[0].online, true);
  assert.equal(result[0].power, 35);
});

test("Acepta el identificador alternativo id", () => {
  const result = applyDeviceStatusEvent(
    [makeDevice()],
    {
      id: "device-1",
      connectivityStatus: "OFFLINE",
    },
  );

  assert.equal(alertCount(result), 1);
});
