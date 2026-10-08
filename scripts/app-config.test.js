const assert = require("node:assert/strict");
const test = require("node:test");
const resolveAppConfig = require("../app.config");

const ENV_KEYS = [
  "EAS_BUILD_PROFILE",
  "APP_ENV",
  "EXPO_PUBLIC_API_URL",
  "APP_LINK_DOMAIN",
  "ANDROID_PACKAGE",
  "IOS_BUNDLE_IDENTIFIER",
];

function resolveConfig(env) {
  const previous = new Map(ENV_KEYS.map((key) => [key, process.env[key]]));
  for (const key of ENV_KEYS) delete process.env[key];
  Object.assign(process.env, env);

  try {
    return { config: resolveAppConfig(), error: null };
  } catch (error) {
    return { config: null, error };
  } finally {
    for (const key of ENV_KEYS) {
      const previousValue = previous.get(key);
      if (previousValue === undefined) delete process.env[key];
      else process.env[key] = previousValue;
    }
  }
}

const productionEnv = {
  APP_ENV: "production",
  EXPO_PUBLIC_API_URL: "https://api.smarthome.com/api/v1",
  APP_LINK_DOMAIN: "links.smarthome.com",
  ANDROID_PACKAGE: "com.smarthome.mobile",
  IOS_BUNDLE_IDENTIFIER: "com.smarthome.mobile",
};

test("el config limita Expo a Android e iOS y conserva el esquema móvil", () => {
  const { config, error } = resolveConfig({});
  assert.equal(error, null);
  assert.deepEqual(config.platforms, ["ios", "android"]);
  assert.equal(config.scheme, "smarthome");
  assert.equal("web" in config, false);
});

test("la configuración de producción bloquea variables faltantes", () => {
  const { error } = resolveConfig({ APP_ENV: "production" });
  assert.ok(error);
  assert.match(error.message, /EXPO_PUBLIC_API_URL/);
  assert.match(error.message, /APP_LINK_DOMAIN/);
  assert.match(error.message, /ANDROID_PACKAGE/);
  assert.match(error.message, /IOS_BUNDLE_IDENTIFIER/);
});

test("la configuración válida genera enlaces nativos para activación y recuperación", () => {
  const { config, error } = resolveConfig(productionEnv);
  assert.equal(error, null);
  assert.equal(config.android.package, productionEnv.ANDROID_PACKAGE);
  assert.equal(config.ios.bundleIdentifier, productionEnv.IOS_BUNDLE_IDENTIFIER);
  assert.deepEqual(config.ios.associatedDomains, [
    "applinks:links.smarthome.com",
  ]);
  assert.deepEqual(
    config.android.intentFilters.map((filter) => filter.data[0].pathPrefix),
    ["/activate-account", "/reset-password"],
  );
  assert.ok(config.android.intentFilters.every((filter) => filter.autoVerify));
});

test("la configuración de producción rechaza dominios de ejemplo", () => {
  const { error } = resolveConfig({
    ...productionEnv,
    APP_LINK_DOMAIN: "example.com",
  });
  assert.ok(error);
  assert.match(error.message, /APP_LINK_DOMAIN/);
});

test("la configuración de producción rechaza una URL de API sin HTTPS", () => {
  const { error } = resolveConfig({
    ...productionEnv,
    EXPO_PUBLIC_API_URL: "http://api.smarthome.com/api/v1",
  });
  assert.ok(error);
  assert.match(error.message, /EXPO_PUBLIC_API_URL/);
});
