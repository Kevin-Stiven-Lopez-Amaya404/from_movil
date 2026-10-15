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

  // Permitir nuevas operaciones aunque una anterior falle.
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

  // Identificar la version de sesion antes de leer el almacenamiento.
  const expectedVersion = sessionMutationVersion;

  // Esperar las operaciones de guardado o eliminacion pendientes.
  await sessionStorageQueue;

  if (expectedVersion !== sessionMutationVersion) return null;

  const currentMemorySession = memorySession as StoredSession | null;
  if (currentMemorySession) {
    return currentMemorySession;
  }

  const serialized = await SecureStore.getItemAsync(SESSION_KEY);

  // Descartar lecturas que pertenecen a una sesion anterior.
  if (expectedVersion !== sessionMutationVersion) return null;

  if (!serialized) {
    return null;
  }

  let normalized: StoredSession | null = null;

  try {
    normalized = normalizeStoredSession(JSON.parse(serialized));
  } catch {
    // Una sesion almacenada con formato invalido se limpiara abajo.
  }

  if (expectedVersion !== sessionMutationVersion) return null;

  const normalizedSession: StoredSession | null = normalized;
  memorySession = normalizedSession;

  const normalizedText = normalizedSession
    ? JSON.stringify(normalizedSession)
    : null;

  // Coordinar las correcciones del almacenamiento con la cola.
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

  // Identificar esta operación de guardado.
  const operationVersion = ++sessionMutationVersion;

  await enqueueSessionStorageOperation(async () => {
    // Evitar guardar una operación reemplazada.
    if (operationVersion !== sessionMutationVersion) {
      throw new Error("La sesión cambió antes de guardarse.");
    }

    await SecureStore.setItemAsync(
      SESSION_KEY,
      JSON.stringify(safeSession),
    );

    // Evitar activar una sesión invalidada durante el guardado.
    if (operationVersion !== sessionMutationVersion) {
      throw new Error("La sesión cambió durante el guardado.");
    }

    memorySession = safeSession;
    notifySessionListeners(safeSession);
  });
}

export async function clearSession(): Promise<void> {
  // Invalidar cualquier guardado o renovación pendiente.
  ++sessionMutationVersion;

  // Limpiar inmediatamente la sesión en memoria.
  memorySession = null;
  refreshPromise = null;

  // Notificar el cierre para limpiar los datos de la interfaz.
  notifySessionListeners(null);

  // Eliminar la sesión persistida después de las escrituras anteriores.
  await enqueueSessionStorageOperation(async () => {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  });
}

/**
 * Obtiene la version actual de la sesion.
 * Permite detectar si otra operacion modifico la sesion.
 */
export function getSessionMutationVersion(): number {
  return sessionMutationVersion;
}

/**
 * Guarda una sesion solamente si no ha comenzado
 * otra operacion de cambio de sesion.
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
 * Cierra la sesion solamente si su version
 * no ha cambiado desde que comenzo la operacion.
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

  // Registrar la version antes de esperar operaciones pendientes.
  const mutationVersionBeforeWait = sessionMutationVersion;

  // No renovar mientras se esta guardando otra sesion.
  await sessionStorageQueue;

  // Descartar la renovacion si cambio la sesion durante la espera.
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
        // No restaurar una sesión que fue cerrada o reemplazada.
        if (
          !nextSession ||
          memorySession !== current ||
          sessionMutationVersion !== initialMutationVersion
        ) {
          return null;
        }

        await saveSession(nextSession);

        // Comprobar que el resultado siga siendo la sesión vigente.
        if (memorySession?.accessToken !== nextSession.accessToken) {
          return null;
        }

        return nextSession;
      })
      .finally(() => {
        // No borrar la referencia de una renovación más reciente.
        if (refreshPromise === pendingRefresh) {
          refreshPromise = null;
        }
      });

    refreshPromise = pendingRefresh;
  }

  return refreshPromise;
}
