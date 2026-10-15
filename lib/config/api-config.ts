/**
 * Configuracion central para conectar el backend real.
 *
 * La aplicacion no utiliza servicios mock ni modo demo.
 * En produccion se exige una URL HTTPS publica y valida.
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
