import {
  clearSession,
  getAccessToken as getSessionAccessToken,
  loadSession,
  saveSession,
} from "@/lib/session/session-store";

/**
 * Compatibilidad temporal para imports antiguos.
 * La sesión real se guarda únicamente en session-store.
 */
export async function saveAccessToken(token: string): Promise<void> {
  const currentSession = await loadSession();

  if (!currentSession) return;

  await saveSession({
    ...currentSession,
    accessToken: token,
  });
}

export async function getAccessToken(): Promise<string | null> {
  return getSessionAccessToken() ?? (await loadSession())?.accessToken ?? null;
}

export async function clearAccessToken(): Promise<void> {
  await clearSession();
}
