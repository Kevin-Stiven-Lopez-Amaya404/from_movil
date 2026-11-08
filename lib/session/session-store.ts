import * as SecureStore from "expo-secure-store";

import type { AuthUser } from "@/lib/services/auth-service";

export type StoredSession = {
  accessToken: string;
  sessionVersion?: number;
  expiresAt?: string;
  user: AuthUser;
  mode?: "demo";
};

const SESSION_KEY = "smart-home.session";

let memorySession: StoredSession | null = null;
let refreshHandler:
  | (() => Promise<StoredSession | null>)
  | null = null;
let refreshPromise: Promise<StoredSession | null> | null = null;
const sessionListeners = new Set<(session: StoredSession | null) => void>();

let sessionMutationVersion = 0;
let sessionStorageQueue: Promise<void> = Promise.resolve();

function enqueueSessionStorageOperation(
  operation: () => Promise<void>,
): Promise<void> {
  const pending = sessionStorageQueue.then(operation, operation);

  // Allow new operations even if a previous one fails.
  sessionStorageQueue = pending.catch(() => undefined);

  return pending;
}

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

function normalizeStoredSession(
  value: unknown,
): StoredSession | null {
  if (!isStoredSession(value)) return null;

  const candidate = value as StoredSession;

  // Rechazar sesiones demo antiguas.
  if (candidate.mode === "demo") {
    return null;
  }

  return {
    accessToken: candidate.accessToken,
    sessionVersion: candidate.sessionVersion,
    expiresAt: candidate.expiresAt,
    user: candidate.user,
  };
}

export async function loadSession(): Promise<StoredSession | null> {
  if (memorySession) {
    return memorySession;
  }

  // Identify the session version before reading the storage.
  const expectedVersion = sessionMutationVersion;

  // Wait for pending save or delete operations.
  await sessionStorageQueue;

  if (expectedVersion !== sessionMutationVersion) return null;

  const currentMemorySession = memorySession as StoredSession | null;
  if (currentMemorySession) {
    return currentMemorySession;
  }

  const serialized = await SecureStore.getItemAsync(SESSION_KEY);

  // Discard reads that belong to a previous session.
  if (expectedVersion !== sessionMutationVersion) return null;

  if (!serialized) {
    return null;
  }

  let normalized: StoredSession | null = null;

  try {
    normalized = normalizeStoredSession(JSON.parse(serialized));
  } catch {
    // A stored session with an invalid format is cleared below.
  }

  if (expectedVersion !== sessionMutationVersion) return null;

  const normalizedSession: StoredSession | null = normalized;
  memorySession = normalizedSession;

  const normalizedText = normalizedSession
    ? JSON.stringify(normalizedSession)
    : null;

  // Coordinate storage fixes with the queue.
  if (normalizedText !== serialized) {
    await enqueueSessionStorageOperation(async () => {
      if (expectedVersion !== sessionMutationVersion) return;

      if (normalizedText === null) {
        await SecureStore.deleteItemAsync(SESSION_KEY);
      } else {
        await SecureStore.setItemAsync(SESSION_KEY, normalizedText);
      }
    });
  }

  return expectedVersion === sessionMutationVersion
    ? memorySession
    : null;
}

export async function saveSession(session: StoredSession): Promise<void> {
  const safeSession = normalizeStoredSession(session);

  if (!safeSession) {
    throw new Error("La sesión no tiene un formato válido.");
  }

  // Identify this save operation.
  const operationVersion = ++sessionMutationVersion;

  await enqueueSessionStorageOperation(async () => {
    // Avoid saving a replaced operation.
    if (operationVersion !== sessionMutationVersion) {
      throw new Error("La sesión cambió antes de guardarse.");
    }

    await SecureStore.setItemAsync(
      SESSION_KEY,
      JSON.stringify(safeSession),
    );

    // Avoid activating a session invalidated during the save.
    if (operationVersion !== sessionMutationVersion) {
      throw new Error("La sesión cambió durante el guardado.");
    }

    memorySession = safeSession;
    notifySessionListeners(safeSession);
  });
}

export async function clearSession(): Promise<void> {
  // Invalidate any pending save or refresh.
  ++sessionMutationVersion;

  // Clear the in-memory session immediately.
  memorySession = null;
  refreshPromise = null;

  // Notify the sign-out so the interface data is cleared.
  notifySessionListeners(null);

  // Delete the persisted session after the previous writes.
  await enqueueSessionStorageOperation(async () => {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  });
}

/**
 * Gets the current session version.
 * Allows detecting whether another operation changed the session.
 */
export function getSessionMutationVersion(): number {
  return sessionMutationVersion;
}

/**
 * Saves a session only if no other session
 * change operation has started.
 */
export async function saveSessionIfUnchanged(
  session: StoredSession,
  expectedVersion: number,
): Promise<boolean> {
  if (sessionMutationVersion !== expectedVersion) {
    return false;
  }

  await saveSession(session);
  return true;
}

/**
 * Closes the session only if its version
 * has not changed since the operation started.
 */
export async function clearSessionIfUnchanged(
  expectedVersion: number,
): Promise<boolean> {
  if (sessionMutationVersion !== expectedVersion) {
    return false;
  }

  await clearSession();
  return true;
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
  handler: () => Promise<StoredSession | null>,
): void {
  refreshHandler = handler;
}

export async function refreshSession(
  expectedAccessToken?: string,
): Promise<StoredSession | null> {
  if (!refreshHandler) return null;

  // Record the version before waiting for pending operations.
  const mutationVersionBeforeWait = sessionMutationVersion;

  // Do not refresh while another session is being saved.
  await sessionStorageQueue;

  // Discard the refresh if the session changed while waiting.
  if (mutationVersionBeforeWait !== sessionMutationVersion) {
    return null;
  }

  const current = await loadSession();

  if (
    !current ||
    (expectedAccessToken !== undefined &&
      current.accessToken !== expectedAccessToken)
  ) {
    return null;
  }

  const initialMutationVersion = sessionMutationVersion;

  if (initialMutationVersion !== mutationVersionBeforeWait) {
    return null;
  }

  if (!refreshPromise) {
    const pendingRefresh = refreshHandler()
      .then(async (nextSession) => {
        // Do not restore a session that was closed or replaced.
        if (
          !nextSession ||
          memorySession !== current ||
          sessionMutationVersion !== initialMutationVersion
        ) {
          return null;
        }

        await saveSession(nextSession);

        // Check that the result is still the current session.
        if (memorySession?.accessToken !== nextSession.accessToken) {
          return null;
        }

        return nextSession;
      })
      .finally(() => {
        // Do not clear the reference to a more recent refresh.
        if (refreshPromise === pendingRefresh) {
          refreshPromise = null;
        }
      });

    refreshPromise = pendingRefresh;
  }

  return refreshPromise;
}
