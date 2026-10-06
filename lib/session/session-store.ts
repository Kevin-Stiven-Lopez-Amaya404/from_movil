import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { setDemoModeEnabled } from "@/lib/config/api-config";
import type { AuthUser } from "@/lib/services/auth-service";

export type StoredSession = {
  accessToken: string;
  refreshToken?: string;
  sessionVersion?: number;
  expiresAt?: string;
  user: AuthUser;
  mode?: "demo";
};

const SESSION_KEY = "smart-home.session";

let memorySession: StoredSession | null = null;
let refreshHandler:
  | ((refreshToken?: string) => Promise<StoredSession | null>)
  | null = null;
let refreshPromise: Promise<StoredSession | null> | null = null;
const sessionListeners = new Set<(session: StoredSession | null) => void>();

function notifySessionListeners(session: StoredSession | null): void {
  sessionListeners.forEach((listener) => listener(session));
}

function isStoredSession(value: unknown): value is StoredSession {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<StoredSession>;
  return (
    typeof candidate.accessToken === "string" &&
    typeof candidate.user === "object" &&
    candidate.user !== null
  );
}

export async function loadSession(): Promise<StoredSession | null> {
  if (memorySession) {
    setDemoModeEnabled(memorySession.mode === "demo");
    return memorySession;
  }

  const serialized = await SecureStore.getItemAsync(SESSION_KEY);
  if (!serialized) {
    setDemoModeEnabled(false);
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(serialized);
    memorySession = isStoredSession(parsed) ? parsed : null;
    setDemoModeEnabled(memorySession?.mode === "demo");
  } catch {
    memorySession = null;
    setDemoModeEnabled(false);
    await SecureStore.deleteItemAsync(SESSION_KEY);
  }

  return memorySession;
}

export async function saveSession(session: StoredSession): Promise<void> {
  setDemoModeEnabled(session.mode === "demo");
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
  memorySession = session;
  notifySessionListeners(session);
}

export async function setDemoSession(session: StoredSession): Promise<void> {
  if (Platform.OS !== "web") {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  }
  setDemoModeEnabled(true);
  memorySession = { ...session, mode: "demo" };
  notifySessionListeners(memorySession);
}

export async function clearSession(): Promise<void> {
  memorySession = null;
  refreshPromise = null;
  setDemoModeEnabled(false);
  try {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  } finally {
    notifySessionListeners(null);
  }
}

export function subscribeToSessionChanges(
  listener: (session: StoredSession | null) => void,
): () => void {
  sessionListeners.add(listener);
  return () => {
    sessionListeners.delete(listener);
  };
}

export function getAccessToken(): string | undefined {
  return memorySession?.accessToken;
}

export function setSessionRefreshHandler(
  handler: (refreshToken?: string) => Promise<StoredSession | null>,
): void {
  refreshHandler = handler;
}

export async function refreshSession(): Promise<StoredSession | null> {
  if (!refreshHandler) return null;

  const current = await loadSession();
  if (!current) return null;

  if (!refreshPromise) {
    refreshPromise = refreshHandler(current.refreshToken)
      .then(async (nextSession) => {
        if (nextSession) await saveSession(nextSession);
        return nextSession;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}
