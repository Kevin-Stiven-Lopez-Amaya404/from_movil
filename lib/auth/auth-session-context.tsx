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
  loadSession,
  saveSession,
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
    refreshToken: session.refreshToken,
    sessionVersion: session.sessionVersion,
    expiresAt: session.expiresAt,
    user: session.user,
    mode: session.mode,
  };
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

    void loadSession()
      .then((session) => {
        applySession(session);
      })
      .catch(() => {
        applySession(null);
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
    try {
      await authService.logout(allSessions);
    } finally {
      await clearSession();
      setUser(null);
      setToken(null);
    }
  }, []);

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
