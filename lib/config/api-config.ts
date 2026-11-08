/**
 * Central configuration to connect to the real backend.
 *
 * The app uses no mock services or demo mode.
 * In production a valid public HTTPS URL is required.
 */
const configuredBaseUrl = process.env.EXPO_PUBLIC_API_URL?.trim() ?? "";
const normalizedBaseUrl = configuredBaseUrl.replace(/\/+$/, "");

function isValidProductionApiUrl(value: string): boolean {
  if (
    !value ||
    /(?:YOUR_|PLACEHOLDER|CHANGE_ME|example\.com|\.(?:invalid|example|test|local)(?:$|\/))/i.test(value)
  ) {
    return false;
  }

  try {
    const parsed = new URL(value);
    const hostname = parsed.hostname.toLowerCase();

    return (
      parsed.protocol === "https:" &&
      hostname.includes(".") &&
      !/^(localhost|.*\.local|.*\.test)$/.test(hostname) &&
      !/^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname) &&
      !parsed.username &&
      !parsed.password
    );
  } catch {
    return false;
  }
}

if (!__DEV__ && !isValidProductionApiUrl(normalizedBaseUrl)) {
  throw new Error(
    "Build móvil de producción inválida: configura EXPO_PUBLIC_API_URL con una URL HTTPS real. Se bloqueó el modo demo.",
  );
}

export const apiConfig = {
  baseUrl: normalizedBaseUrl,
  timeoutMs: 12000,
};
