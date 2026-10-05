import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { normalizeEmail, authService, type AuthUser } from "@/lib/services/auth-service";
import {
  clearAccessToken,
  getAccessToken,
  saveAccessToken,
} from "@/lib/auth/token-storage";

type AuthSessionContextValue = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
};

const AuthSessionContext = createContext<AuthSessionContextValue | undefined>(
  undefined,
);

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      try {
        const storedToken = await getAccessToken();

        if (!mounted) return;

        if (storedToken) {
          setToken(storedToken);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void restoreSession();

    return () => {
      mounted = false;
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

    if (session.token) {
      await saveAccessToken(session.token);
      setToken(session.token);
    } else {
      await clearAccessToken();
      setToken(null);
    }

    setUser(session.user);

    return session.user;
  }, []);

  const logout = useCallback(async () => {
    await clearAccessToken();
    setToken(null);
    setUser(null);
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
