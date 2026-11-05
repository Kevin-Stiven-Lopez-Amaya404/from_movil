// The release must not promise a pairing flow that is gated to development.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const ts = require("typescript");

const source = fs.readFileSync(path.join(__dirname, "../lib/pairing/shelly-release-policy.ts"), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const loaded = { exports: {} };
new Function("require", "module", "exports", compiled)(require, loaded, loaded.exports);
const { shellyPairingAvailability } = loaded.exports;

test("release build disables Shelly pairing with a user-facing explanation", () => {
  const state = shellyPairingAvailability(false);
  assert.equal(state.canPair, false);
  assert.match(state.reason, /vinculación de Shelly/);
  assert.match(state.reason, /No se creará una sesión incompleta/);
});

test("development build preserves existing laboratory pairing", () => {
  assert.deepEqual(shellyPairingAvailability(true), { canPair: true, reason: null });
});

test("LAN discovery and creation screen use the same release guard", () => {
  const add = fs.readFileSync(path.join(__dirname, "../app/(tabs)/add-device.tsx"), "utf8");
  const prepare = fs.readFileSync(path.join(__dirname, "../app/(tabs)/prepare-shelly.tsx"), "utf8");
  assert.match(add, /shellyPairingAvailability\(__DEV__\)/);
  assert.match(prepare, /shellyPairingAvailability\(__DEV__\)/);
  assert.match(add, /!pairingAvailability\.canPair \|\| wifiSearchLock\.current/);
  assert.match(add, /!pairingAvailability\.canPair \|\|/);
  assert.match(prepare, /if \(!pairingAvailability\.canPair\) \{\s*setPairingError/);
  assert.match(prepare, /disabled=\{pairingLoading \|\| !pairingAvailability\.canPair\}/);
  assert.match(prepare, /!pairingAvailability\.canPair \? \(/);
});
