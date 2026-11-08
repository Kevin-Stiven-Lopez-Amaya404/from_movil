import {
  clearSession,
  getAccessToken as getSessionAccessToken,
  loadSession,
  saveSession,
} from "@/lib/session/session-store";

/**
 * Temporary compatibility for old imports.
 * The real session is stored only in session-store.
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
