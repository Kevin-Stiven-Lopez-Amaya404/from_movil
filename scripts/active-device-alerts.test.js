
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

// Compila la función TypeScript para probar la implementación
// real, sin duplicar su lógica ni agregar dependencias.
const source = readFileSync(
  path.join(
    __dirname,
    "../lib/alerts/active-device-alerts.ts"
  ),
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
  filename: "active-device-alerts.js",
});

const { getActiveDeviceAlerts } = sandbox.exports;

const homes = [{ id: "home-1", name: "Casa principal" }];
const loaded = { "home-1": "loaded" };

function device(connectivityStatus, id = "device-1") {
  return {
    id,
    homeId: "home-1",
    name: "Shelly cocina",
    connectivityStatus,
  };
}

test("OFFLINE confirmado genera una alerta", () => {
  const alerts = getActiveDeviceAlerts(
    [device("OFFLINE")],
    homes,
    loaded,
  );

  assert.equal(alerts.length, 1);
  assert.equal(alerts[0].deviceId, "device-1");
  assert.equal(alerts[0].homeId, "home-1");
});

test("ONLINE no genera alertas", () => {
  assert.equal(
    getActiveDeviceAlerts(
      [device("ONLINE")],
      homes,
      loaded,
    ).length,
    0,
  );
});

test("UNKNOWN no genera desconexiones falsas", () => {
  assert.equal(
    getActiveDeviceAlerts(
      [device("UNKNOWN")],
      homes,
      loaded,
    ).length,
    0,
  );
});

test("Estado ausente no se interpreta como OFFLINE", () => {
  assert.equal(
    getActiveDeviceAlerts(
      [device(undefined)],
      homes,
      loaded,
    ).length,
    0,
  );
});

test("No muestra alertas mientras carga un hogar", () => {
  assert.equal(
    getActiveDeviceAlerts(
      [device("OFFLINE")],
      homes,
      { "home-1": "loading" },
    ).length,
    0,
  );
});

test("No muestra alertas si la consulta falló", () => {
  assert.equal(
    getActiveDeviceAlerts(
      [device("OFFLINE")],
      homes,
      { "home-1": "error" },
    ).length,
    0,
  );
});

test("No muestra dispositivos de hogares inaccesibles", () => {
  assert.equal(
    getActiveDeviceAlerts(
      [device("OFFLINE")],
      [],
      loaded,
    ).length,
    0,
  );
});

test("Evita alertas duplicadas por dispositivo", () => {
  assert.equal(
    getActiveDeviceAlerts(
      [device("OFFLINE"), device("OFFLINE")],
      homes,
      loaded,
    ).length,
    1,
  );
});

test("Distingue dos dispositivos desconectados", () => {
  assert.equal(
    getActiveDeviceAlerts(
      [
        device("OFFLINE", "device-1"),
        device("OFFLINE", "device-2"),
      ],
      homes,
      loaded,
    ).length,
    2,
  );
});

test("La alerta desaparece al reconectarse", () => {
  const disconnected = getActiveDeviceAlerts(
    [device("OFFLINE")],
    homes,
    loaded,
  );

  const reconnected = getActiveDeviceAlerts(
    [device("ONLINE")],
    homes,
    loaded,
  );

  assert.equal(disconnected.length, 1);
  assert.equal(reconnected.length, 0);
});
