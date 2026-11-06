import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

function major(version) {
  const match = /^(\d+)\./.exec(String(version ?? ""));
  return match ? Number(match[1]) : null;
}

export function inspectCompatibility(manifest, lock) {
  if (!manifest || typeof manifest !== "object" || !lock || lock.lockfileVersion !== 3 ||
    !lock.packages || typeof lock.packages !== "object") {
    throw new Error("Requires package.json and a valid npm lockfile v3.");
  }

  const root = lock.packages[""]?.dependencies;
  if (!root || typeof root !== "object") {
    throw new Error("Lockfile has no root dependency declaration.");
  }

  const errors = [];
  const warnings = [];
  for (const name of ["expo", "expo-router", "react-native"]) {
    if (root[name] !== manifest.dependencies?.[name]) {
      errors.push("Manifest/lockfile disagree on " + name + "; regenerate lockfile with npm.");
    }
  }

  const pkg = (name) => lock.packages["node_modules/" + name];
  const router = pkg("expo-router");
  const query = pkg("query-string");
  const decoder = pkg("decode-uri-component");
  const cli = pkg("@expo/cli");
  const zod = pkg("zod");
  const entries = [["expo-router", router], ["query-string", query],
    ["decode-uri-component", decoder], ["@expo/cli", cli], ["zod", zod]];

  for (const [name, entry] of entries) {
    if (!entry || typeof entry.version !== "string") {
      errors.push("Cannot inspect " + name + " in the root dependency graph. Inspect nested installs separately.");
    }
  }

  if (router && query && major(router.version) === 57 && major(query.version) >= 8) {
    errors.push("Expo Router 57 expects query-string 7 CommonJS API; query-string 8+ needs compatibility proof.");
  }
  if (query?.dependencies?.["decode-uri-component"]?.startsWith("^0.2") && decoder &&
    major(query.version) === 7 && decoder.version.startsWith("0.5.") &&
    !String(decoder.resolved ?? "").startsWith("file:")) {
    errors.push("query-string 7 expects a callable CommonJS decoder; upstream decode-uri-component 0.5.x is ESM-only.");
  }
  if (cli?.dependencies?.zod?.startsWith("^3") && major(zod?.version) >= 4) {
    errors.push("Expo CLI 57 declares Zod 3; replacing it with Zod 4 needs upstream compatibility proof.");
  }

  if (decoder && /^0\.[0-4]\./.test(decoder.version) || decoder?.version === "0.5.0") {
    warnings.push("decode-uri-component@" + decoder.version +
      " is affected by GHSA-qr28-fpjm-wq7f (fix: 0.5.1); parent entries may also be marked high.");
  }
  if (zod && major(zod.version) === 3) {
    warnings.push("zod@" + zod.version +
      " is affected by GHSA-mrhx-c7xc-m3w5 (fix: 4.6.6); parent entries may also be marked high.");
  }

  return {
    errors, warnings,
    resolved: Object.fromEntries(entries.filter(([, entry]) => entry)
      .map(([name, entry]) => [name, entry.version])),
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const manifest = JSON.parse(readFileSync("package.json", "utf8"));
    const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
    const result = inspectCompatibility(manifest, lock);
    console.log("SDK 57 dependency compatibility check:\n" + JSON.stringify(result, null, 2));
    if (result.errors.length) process.exitCode = 1;
    console.log("This checks compatibility hazards, NOT vulnerability clearance. npm audit remains mandatory.");
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
