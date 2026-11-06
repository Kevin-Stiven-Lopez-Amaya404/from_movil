import test from "node:test";
import assert from "node:assert/strict";
import { inspectCompatibility } from "./dependency-compatibility.mjs";

function fixtures() {
  const manifest = { dependencies: {
    expo: "~57.0.31", "expo-router": "~57.0.29", "react-native": "0.86.3",
  } };
  const packages = {
    "": { dependencies: { ...manifest.dependencies } },
    "node_modules/expo-router": { version: "57.0.29", dependencies: { "query-string": "^7.1.3" } },
    "node_modules/query-string": { version: "7.1.3", dependencies: { "decode-uri-component": "^0.2.2" } },
    "node_modules/decode-uri-component": { version: "0.2.2" },
    "node_modules/@expo/cli": { version: "57.0.32", dependencies: { zod: "^3.25.76" } },
    "node_modules/zod": { version: "3.25.76" },
  };
  return { manifest, lock: { lockfileVersion: 3, packages } };
}

test("current SDK 57 chain stays a warning, not a false security pass", () => {
  const { manifest, lock } = fixtures();
  const result = inspectCompatibility(manifest, lock);
  assert.equal(result.errors.length, 0);
  assert.equal(result.warnings.length, 2);
  assert.equal(result.resolved.zod, "3.25.76");
});

test("rejects query-string 8 under Expo Router 57", () => {
  const { manifest, lock } = fixtures();
  lock.packages["node_modules/query-string"].version = "8.0.0";
  assert.match(inspectCompatibility(manifest, lock).errors.join(" "), /CommonJS/);
});

test("rejects upstream ESM-only decoder under query-string 7", () => {
  const { manifest, lock } = fixtures();
  lock.packages["node_modules/decode-uri-component"].version = "0.5.1";
  assert.match(inspectCompatibility(manifest, lock).errors.join(" "), /ESM-only/);
});

test("rejects unverified Zod 4 under Expo CLI 57", () => {
  const { manifest, lock } = fixtures();
  lock.packages["node_modules/zod"].version = "4.6.6";
  assert.match(inspectCompatibility(manifest, lock).errors.join(" "), /Zod 4/);
});

test("rejects manifest/lockfile drift", () => {
  const { manifest, lock } = fixtures();
  manifest.dependencies.expo = "~58.0.0";
  assert.match(inspectCompatibility(manifest, lock).errors.join(" "), /disagree/);
});

test("fails closed on malformed or incomplete lockfile", () => {
  const { manifest, lock } = fixtures();
  assert.throws(() => inspectCompatibility(manifest, {}), /lockfile/);
  delete lock.packages["node_modules/zod"];
  assert.match(inspectCompatibility(manifest, lock).errors.join(" "), /Cannot inspect zod/);
});
