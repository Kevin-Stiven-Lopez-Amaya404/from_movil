/**
 * Configuracion central para conectar backend.
 *
 * Mientras `EXPO_PUBLIC_API_URL` no exista, la app usa servicios mock locales.
 * Cuando tengas backend, define esa variable y los servicios empezaran a usar
 * HTTP sin tocar pantallas.
 */
export const apiConfig = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ?? "",
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
