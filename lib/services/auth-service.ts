import { apiClient } from "@/lib/api/api-client";
import { ApiError } from "@/lib/api/api-error";
import type { UserRole } from "@/lib/domain/session";
import {
    clearSession,
    loadSession,
    setSessionRefreshHandler,
    type StoredSession,
} from "@/lib/session/session-store";

export type { UserRole } from "@/lib/domain/session";

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
  mode?: "demo";
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
  id?: string;
  userId?: string;
  role?: string;
  name?: string;
  email?: string;
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

export type DeactivateAccountResponse = {
  message: string;
  status: "DEACTIVATED";
  deactivatedAt: string;
};

export type RequestAccountReactivationResponse = {
  sent: boolean;
};

export type ReactivateAccountResponse = {
  reactivated: boolean;
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
  deactivateAccount(): Promise<DeactivateAccountResponse>;
  requestAccountReactivation(
    email: string,
  ): Promise<RequestAccountReactivationResponse>;
  reactivateAccount(token: string): Promise<ReactivateAccountResponse>;
  logout(allSessions?: boolean): Promise<void>;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeBackendUser(user: AuthUser): AuthUser {
  return {
    id: user.id,
    email: normalizeEmail(user.email),
    name: user.name,
    backendRole: user.role,
  };
}

const backendAuthService: AuthService = {
  async login(credentials) {
    const response = await apiClient.post<AuthSession, LoginRequest>(
      "/api/v1/auth/login",
      {
        email: normalizeEmail(credentials.email),
        password: credentials.password,
      },
      { skipAuthRefresh: true },
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
      }, { skipAuthRefresh: true });

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
      { skipAuthRefresh: true },
    );
  },

  async resendActivation(email: string) {
    await apiClient.post<Record<string, unknown>, { email: string }>(
      "/api/v1/auth/resend-activation",
      { email: normalizeEmail(email) },
      { skipAuthRefresh: true },
    );
  },

  async requestPasswordReset(email: string) {
    await apiClient.post<Record<string, unknown>, { email: string }>(
      "/api/v1/auth/forgot-password",
      { email: normalizeEmail(email) },
      { skipAuthRefresh: true },
    );
  },

  async resetPassword(request) {
    await apiClient.post<Record<string, unknown>, PasswordResetRequest>(
      "/api/v1/auth/reset-password",
      request,
      { skipAuthRefresh: true },
    );
  },

  async changePassword(request) {
    await apiClient.patch<Record<string, unknown>, ChangePasswordRequest>(
      "/api/v1/auth/change-password",
      request,
    );
  },

  async deactivateAccount() {
    return apiClient.patch<
      DeactivateAccountResponse,
      { confirm: true }
    >(
      "/api/v1/users/me/deactivate",
      { confirm: true },
    );
  },

  async requestAccountReactivation(email) {
    return apiClient.post<
      RequestAccountReactivationResponse,
      { email: string }
    >(
      "/api/v1/auth/request-reactivation",
      { email: normalizeEmail(email) },
      { skipAuthRefresh: true, skipAuthHeader: true },
    );
  },

  async reactivateAccount(token) {
    return apiClient.post<
      ReactivateAccountResponse,
      { token: string }
    >(
      "/api/v1/auth/reactivate",
      { token },
      { skipAuthRefresh: true, skipAuthHeader: true },
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

export const authService: AuthService = backendAuthService;

setSessionRefreshHandler(async (): Promise<StoredSession | null> => {
  // Identificar la sesión antes de solicitar la renovación.
  const originalSession = await loadSession();
  if (!originalSession) return null;

  const response = await apiClient.post<{ accessToken?: string }>(
    "/api/v1/auth/refresh",
    undefined,
    {
      skipAuthRefresh: true,
      skipAuthHeader: true,
    },
  );

  // Comprobar que el usuario no haya cerrado o cambiado de sesión.
  const activeSession = await loadSession();

  if (!response.accessToken || activeSession !== originalSession) {
    return null;
  }

  return {
    ...originalSession,
    accessToken: response.accessToken,
  };
});
