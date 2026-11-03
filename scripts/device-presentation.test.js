const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

const source = readFileSync(
  path.join(__dirname, "../lib/utils/device-presentation.ts"),
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
  filename: "device-presentation.js",
});

const { getDevicePresentationList } = sandbox.exports;
const homes = [
  { id: "home-1", name: "Casa Jardín" },
  { id: "home-2", name: "Apartamento Norte" },
];
const devices = [
  { id: "device-1", homeId: "home-1", name: "Lámpara sala" },
  { id: "device-2", homeId: "home-2", name: "Lámpara balcón" },
  { id: "device-3", homeId: "hidden-home", name: "Equipo privado" },
];

test("limits presentation to devices in accessible homes", () => {
  const result = getDevicePresentationList(devices, homes, "", null);

  assert.deepEqual(
    result.accessibleDevices.map((device) => device.id),
    ["device-1", "device-2"],
  );
  assert.deepEqual(
    result.visibleDevices.map((device) => device.id),
    ["device-1", "device-2"],
  );
});

test("searches device and home names without case or accent sensitivity", () => {
  const byDeviceName = getDevicePresentationList(
    devices,
    homes,
    "LAMPARA SALA",
    null,
  );
  const byHomeName = getDevicePresentationList(
    devices,
    homes,
    "jardin",
    null,
  );

  assert.deepEqual(
    byDeviceName.visibleDevices.map((device) => device.id),
    ["device-1"],
  );
  assert.deepEqual(
    byHomeName.visibleDevices.map((device) => device.id),
    ["device-1"],
  );
});

test("combines the selected home and query without changing the source list", () => {
  const originalIds = devices.map((device) => device.id);
  const result = getDevicePresentationList(
    devices,
    homes,
    "lampara",
    "home-2",
  );

  assert.deepEqual(
    result.visibleDevices.map((device) => device.id),
    ["device-2"],
  );
  assert.deepEqual(
    devices.map((device) => device.id),
    originalIds,
  );
});
