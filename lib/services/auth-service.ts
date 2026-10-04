import { apiClient } from "@/lib/api/api-client";
import { ApiError } from "@/lib/api/api-error";
import { useMockApi } from "@/lib/config/api-config";
import {
    clearSession,
    loadSession,
    setSessionRefreshHandler,
    type StoredSession,
} from "@/lib/session/session-store";

export type UserRole = "admin" | "miembro" | "invitado";

export type AuthUser = {
  id?: string;
  documentNumber?: string;
  documentType?: string;
  email: string;
  name: string;
  role?: UserRole;
  backendRole?: string;
};

export type AuthSession = {
  token?: string;
  accessToken?: string;
  tokenType?: "Bearer";
  refreshToken?: string;
  sessionVersion?: number;
  expiresAt?: string;
  user: AuthUser;
};

export type RegisteredUser = {
  id: string;
  name: string;
  email: string;
  status: string;
  emailVerified: boolean;
};

export type AuthenticatedUser = {
  userId: string;
  role: string;
};

export type RegisterUserRequest = {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type PasswordResetRequest = {
  token: string;
  password: string;
  passwordConfirmation: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
};

type InternalMockUser = AuthUser & {
  password: string;
};

export type RegisterResult =
  | { ok: true; reason: null; user: RegisteredUser }
  | { ok: false; reason: "email-exists" };

export interface AuthService {
  login(credentials: LoginRequest): Promise<AuthSession | null>;
  register(user: RegisterUserRequest): Promise<RegisterResult>;
  getCurrentUser(): Promise<AuthenticatedUser>;
  activateAccount(token: string): Promise<void>;
  resendActivation(email: string): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  resetPassword(request: PasswordResetRequest): Promise<void>;
  changePassword(request: ChangePasswordRequest): Promise<void>;
  logout(allSessions?: boolean): Promise<void>;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

const mockUsers: InternalMockUser[] = [
  {
    email: "admin@smarthome.com",
    password: "1234",
    name: "Admin",
    role: "admin",
  },
  {
    email: "pepe@smarthome.com",
    password: "Smart123!",
    name: "Pepe",
    role: "miembro",
  },
  {
    email: "miembro@smarthome.com",
    password: "1234",
    name: "Miembro Demo",
    role: "miembro",
  },
  {
    email: "invitado@smarthome.com",
    password: "1234",
    name: "Invitado Demo",
    role: "invitado",
  },
];

function withoutPassword(user: InternalMockUser): AuthUser {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

function normalizeBackendUser(user: AuthUser): AuthUser {
  return {
    id: user.id,
    email: normalizeEmail(user.email),
    name: user.name,
    backendRole: user.role,
  };
}

function backendUnavailable(): ApiError {
  return new ApiError(
    "Esta operación requiere conexión con el backend.",
    "NETWORK_ERROR",
  );
}

const mockAuthService: AuthService = {
  async login({ email, password }) {
    const cleanEmail = normalizeEmail(email);

    const user = mockUsers.find((item) => item.email === cleanEmail);

    if (!user || user.password !== password) {
      return null;
    }

    return {
      accessToken: "mock-session-token",
      user: withoutPassword(user),
    };
  },

  async register() {
    throw new ApiError(
      "No se puede crear una cuenta real sin conectar con el backend.",
      "NETWORK_ERROR",
    );
  },

  async getCurrentUser() {
    throw backendUnavailable();
  },

  async activateAccount() {
    throw backendUnavailable();
  },

  async resendActivation() {
    throw backendUnavailable();
  },

  async requestPasswordReset() {
    throw backendUnavailable();
  },

  async resetPassword() {
    throw backendUnavailable();
  },

  async changePassword() {
    throw backendUnavailable();
  },

  async logout() {
    await clearSession();
  },
};

export function loginDemoAccount(): Promise<AuthSession | null> {
  return mockAuthService.login({
    email: "pepe@smarthome.com",
    password: "Smart123!",
  });
}

const backendAuthService: AuthService = {
  async login(credentials) {
    const response = await apiClient.post<AuthSession, LoginRequest>(
      "/api/v1/auth/login",
      {
        email: normalizeEmail(credentials.email),
        password: credentials.password,
      },
    );

    return {
      ...response,
      user: normalizeBackendUser(response.user),
    };
  },

  async register(user) {
    try {
      const createdUser = await apiClient.post<
        RegisteredUser,
        RegisterUserRequest
      >("/api/v1/auth/register", {
        ...user,
        email: normalizeEmail(user.email),
      });

      return {
        ok: true,
        reason: null,
        user: {
          ...createdUser,
          email: normalizeEmail(createdUser.email),
        },
      };
    } catch (error) {
      if (error instanceof ApiError && error.code === "CONFLICT") {
        return {
          ok: false,
          reason: "email-exists",
        };
      }

      throw error;
    }
  },

  getCurrentUser() {
    return apiClient.get<AuthenticatedUser>("/api/v1/auth/me");
  },

  async activateAccount(token: string) {
    await apiClient.post<Record<string, unknown>, { token: string }>(
      "/api/v1/auth/activate",
      { token },
    );
  },

  async resendActivation(email: string) {
    await apiClient.post<Record<string, unknown>, { email: string }>(
      "/api/v1/auth/resend-activation",
      { email: normalizeEmail(email) },
    );
  },

  async requestPasswordReset(email: string) {
    await apiClient.post<Record<string, unknown>, { email: string }>(
      "/api/v1/auth/forgot-password",
      { email: normalizeEmail(email) },
    );
  },

  async resetPassword(request) {
    await apiClient.post<Record<string, unknown>, PasswordResetRequest>(
      "/api/v1/auth/reset-password",
      request,
    );
  },

  async changePassword(request) {
    await apiClient.patch<Record<string, unknown>, ChangePasswordRequest>(
      "/api/v1/auth/change-password",
      request,
    );
  },

  async logout(allSessions = false) {
    try {
      await apiClient.post(
        allSessions ? "/api/v1/auth/logout-all" : "/api/v1/auth/logout",
        undefined,
        { skipAuthRefresh: true },
      );
    } finally {
      await clearSession();
    }
  },
};

const mockAuthServiceWithLogout: AuthService = {
  ...mockAuthService,
  async logout() {
    await clearSession();
  },
};

export const authService: AuthService = new Proxy(mockAuthServiceWithLogout, {
  get(_target, property) {
    const service = useMockApi ? mockAuthServiceWithLogout : backendAuthService;
    const value: unknown = Reflect.get(service, property, service);
    return typeof value === "function" ? value.bind(service) : value;
  },
});

setSessionRefreshHandler(async (): Promise<StoredSession | null> => {
  if (useMockApi) return null;

  const response = await apiClient.post<{ accessToken?: string }>(
    "/api/v1/auth/refresh",
    undefined,
    { skipAuthRefresh: true },
  );

  const currentSession = await loadSession();
  if (!response.accessToken || !currentSession) return null;

  return {
    ...currentSession,
    accessToken: response.accessToken,
  };
});
