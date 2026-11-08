import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  authService,
  normalizeEmail,
  type AuthSession,
  type AuthUser,
} from "@/lib/services/auth-service";
import {
  clearSession,
  clearSessionIfUnchanged,
  getSessionMutationVersion,
  loadSession,
  saveSession,
  saveSessionIfUnchanged,
  subscribeToSessionChanges,
  type StoredSession,
} from "@/lib/session/session-store";

type AuthSessionContextValue = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: (allSessions?: boolean) => Promise<void>;
};

const AuthSessionContext = createContext<AuthSessionContextValue | undefined>(
  undefined,
);

function toStoredSession(session: AuthSession): StoredSession {
  const accessToken = session.accessToken ?? session.token;

  if (!accessToken) {
    throw new Error("El backend no devolvió un access token válido.");
  }

  return {
    accessToken,
    sessionVersion: session.sessionVersion,
    expiresAt: session.expiresAt,
    user: session.user,
    mode: session.mode,
  };
}

async function restoreStoredSession(
  session: StoredSession | null,
  expectedVersion: number,
): Promise<StoredSession | null> {
  if (!session) return null;

  // An old demo session must never be restored.
  if (session.mode === "demo") {
    await clearSessionIfUnchanged(expectedVersion);
    return null;
  }

  const currentUser = await authService.getCurrentUser();

  const currentId = currentUser.id ?? currentUser.userId;
  const currentEmail = currentUser.email
    ? normalizeEmail(currentUser.email)
    : undefined;

  const storedId = session.user.id;
  const storedEmail = normalizeEmail(session.user.email);

  if (
    (currentId && storedId && currentId !== storedId) ||
    (currentEmail && currentEmail !== storedEmail)
  ) {
    throw new Error("La sesión no corresponde al usuario almacenado.");
  }

  const validatedUser: AuthUser = {
    ...session.user,
    ...(currentId ? { id: currentId } : {}),
    ...(currentEmail ? { email: currentEmail } : {}),
    ...(currentUser.name ? { name: currentUser.name } : {}),
    ...(currentUser.role ? { backendRole: currentUser.role } : {}),
  };

  const validatedSession: StoredSession = {
    ...session,
    user: validatedUser,
  };

  const saved = await saveSessionIfUnchanged(
    validatedSession,
    expectedVersion,
  );

  return saved ? validatedSession : null;
}

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    function applySession(session: StoredSession | null): void {
      if (!mounted) return;

      setUser(session?.user ?? null);
      setToken(session?.accessToken ?? null);
    }

    const unsubscribe = subscribeToSessionChanges(applySession);

    const restorationVersion = getSessionMutationVersion();

    void loadSession()
      .then((session) => {
        // Do not restore if another session change started.
        if (getSessionMutationVersion() !== restorationVersion) {
          return null;
        }

        return restoreStoredSession(session, restorationVersion);
      })
      .then((session) => {
        // Prevent an old response from updating the interface.
        // If the restore saved the session, the listener
        // already received and applied that update.
        if (getSessionMutationVersion() === restorationVersion) {
          applySession(session);
        }
      })
      .catch(async () => {
        // Do not close a new session because of an old error.
        // The listener updates the interface.
        await clearSessionIfUnchanged(restorationVersion);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const session = await authService.login({
      email: normalizeEmail(email),
      password,
    });

    if (!session) {
      throw new Error("Correo o contraseña incorrectos.");
    }

    const storedSession = toStoredSession(session);
    await saveSession(storedSession);

    return storedSession.user;
  }, []);

  const logout = useCallback(async (allSessions = false) => {
    // Start the revocation with the current token before clearing the store.
    // Its response must not block the local sign-out or clear a later login.
    void authService.logout(allSessions, token ?? undefined).catch(() => undefined);

    await clearSession();
    setUser(null);
    setToken(null);
  }, [token]);

  const value = useMemo<AuthSessionContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
    }),
    [user, token, isLoading, login, logout],
  );

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession(): AuthSessionContextValue {
  const context = useContext(AuthSessionContext);

  if (!context) {
    throw new Error(
      "useAuthSession debe utilizarse dentro de AuthSessionProvider.",
    );
  }

  return context;
}
