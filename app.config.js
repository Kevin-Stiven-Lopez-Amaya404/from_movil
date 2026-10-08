const { expo: baseConfig } = require("./app.json");

const PLACEHOLDER_PATTERN =
  /(?:YOUR[_-]|PLACEHOLDER|CHANGE[_-]?ME|example\.com|\.(?:invalid|example|test|local)(?=[:/?#]|$))/i;

function isPlaceholder(value) {
  return !value || PLACEHOLDER_PATTERN.test(value);
}

function parsePublicHttpsUrl(value, allowPath) {
  if (isPlaceholder(value)) return null;

  try {
    const rawValue = value.trim();
    const normalizedValue =
      !allowPath && !/^[a-z][a-z0-9+.-]*:\/\//i.test(rawValue)
        ? `https://${rawValue}`
        : rawValue;
    const parsed = new URL(normalizedValue);
    const host = parsed.hostname.toLowerCase();
    const isIpv4 = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(host);
    const isLocalHost =
      host === "localhost" ||
      host.endsWith(".local") ||
      host.endsWith(".test") ||
      isIpv4;

    if (
      parsed.protocol !== "https:" ||
      !host.includes(".") ||
      isLocalHost ||
      parsed.username ||
      parsed.password ||
      parsed.search ||
      parsed.hash ||
      (!allowPath && (parsed.pathname !== "/" || parsed.port))
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function getAndroidPackage(value) {
  if (
    isPlaceholder(value) ||
    !/^[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)+$/.test(value ?? "")
  ) {
    return null;
  }
  return value;
}

function getIosBundleIdentifier(value) {
  if (
    isPlaceholder(value) ||
    !/^[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/.test(value ?? "")
  ) {
    return null;
  }
  return value;
}

function getProductionConfigErrors() {
  const errors = [];
  if (!parsePublicHttpsUrl(process.env.EXPO_PUBLIC_API_URL ?? "", true)) {
    errors.push("EXPO_PUBLIC_API_URL (URL HTTPS pública del backend)");
  }
  if (!parsePublicHttpsUrl(process.env.APP_LINK_DOMAIN ?? "", false)) {
    errors.push("APP_LINK_DOMAIN (dominio HTTPS de los enlaces de correo)");
  }
  if (!getAndroidPackage(process.env.ANDROID_PACKAGE ?? "")) {
    errors.push("ANDROID_PACKAGE (identificador de publicación Android)");
  }
  if (!getIosBundleIdentifier(process.env.IOS_BUNDLE_IDENTIFIER ?? "")) {
    errors.push("IOS_BUNDLE_IDENTIFIER (identificador de publicación iOS)");
  }
  return errors;
}

module.exports = () => {
  const isProduction =
    process.env.EAS_BUILD_PROFILE === "production" ||
    process.env.APP_ENV === "production";

  if (isProduction) {
    const errors = getProductionConfigErrors();
    if (errors.length > 0) {
      throw new Error(
        `Configuración móvil de producción incompleta:\n- ${errors.join("\n- ")}\nConfigura los valores reales en el entorno production de EAS.`,
      );
    }
  }

  const appLink = parsePublicHttpsUrl(
    process.env.APP_LINK_DOMAIN ?? "",
    false,
  );
  const androidPackage = getAndroidPackage(
    process.env.ANDROID_PACKAGE ?? "",
  );
  const iosBundleIdentifier = getIosBundleIdentifier(
    process.env.IOS_BUNDLE_IDENTIFIER ?? "",
  );

  const android = {
    ...baseConfig.android,
    ...(androidPackage ? { package: androidPackage } : {}),
    ...(appLink
      ? {
          intentFilters: [
            ...(baseConfig.android.intentFilters ?? []),
            ...["/activate-account", "/reset-password"].map((pathPrefix) => ({
              action: "VIEW",
              autoVerify: true,
              data: [
                {
                  scheme: "https",
                  host: appLink.hostname,
                  pathPrefix,
                },
              ],
              category: ["BROWSABLE", "DEFAULT"],
            })),
          ],
        }
      : {}),
  };

  const ios = {
    ...baseConfig.ios,
    ...(iosBundleIdentifier ? { bundleIdentifier: iosBundleIdentifier } : {}),
    ...(appLink
      ? {
          associatedDomains: [
            ...(baseConfig.ios.associatedDomains ?? []),
            `applinks:${appLink.hostname}`,
          ],
        }
      : {}),
  };

  return {
    ...baseConfig,
    platforms: ["ios", "android"],
    android,
    ios,
  };
};
