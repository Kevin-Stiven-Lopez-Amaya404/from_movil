/**
 * Configuracion central para conectar backend.
 *
 * En desarrollo local, una URL vacia permite usar servicios mock.
 * Una build de produccion nunca debe iniciar en modo demo por falta de API.
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

let demoModeEnabled = false;

export let useMockApi = apiConfig.baseUrl.length === 0;

export function isDemoModeEnabled(): boolean {
  return demoModeEnabled;
}

export function setDemoModeEnabled(enabled: boolean): void {
  demoModeEnabled = enabled;
  useMockApi = apiConfig.baseUrl.length === 0 || demoModeEnabled;
}
