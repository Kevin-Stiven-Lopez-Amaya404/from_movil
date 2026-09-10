import { apiClient } from "@/lib/api/api-client";
import { ApiError } from "@/lib/api/api-error";
import { useMockApi } from "@/lib/config/api-config";

export type UserRole = "admin" | "miembro" | "invitado";

export type AuthUser = {
  documentNumber?: string;
  documentType?: string;
  email: string;
  name: string;
  role?: UserRole;
};

export type AuthSession = {
  token?: string;
  user: AuthUser;
};

export type RegisterUserRequest = AuthUser & {
  password: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type UpdatePasswordRequest = {
  email: string;
  password: string;
};

type InternalMockUser = AuthUser & {
  password: string;
};

export type RegisterResult =
  | { ok: true; reason: null; user: AuthUser }
  | { ok: false; reason: "email-exists" };

export interface AuthService {
  login(credentials: LoginRequest): Promise<AuthSession | null>;
  register(user: RegisterUserRequest): Promise<RegisterResult>;
  updatePassword(request: UpdatePasswordRequest): Promise<boolean>;
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

const mockAuthService: AuthService = {
  async login({ email, password }) {
    const cleanEmail = normalizeEmail(email);

    const user = mockUsers.find((item) => item.email === cleanEmail);

    if (!user || user.password !== password) {
      return null;
    }

    return {
      token: "mock-session-token",
      user: withoutPassword(user),
    };
  },

  async register(user) {
    const cleanEmail = normalizeEmail(user.email);

    const existingUser = mockUsers.find((item) => item.email === cleanEmail);

    if (existingUser) {
      return {
        ok: false,
        reason: "email-exists",
      };
    }

    const createdUser: InternalMockUser = {
      ...user,
      email: cleanEmail,
    };

    mockUsers.push(createdUser);

    return {
      ok: true,
      reason: null,
      user: withoutPassword(createdUser),
    };
  },

  async updatePassword({ email, password }) {
    const cleanEmail = normalizeEmail(email);

    const user = mockUsers.find((item) => item.email === cleanEmail);

    if (!user) {
      return false;
    }

    user.password = password;

    return true;
  },
};

const backendAuthService: AuthService = {
  async login(credentials) {
    return apiClient.post<AuthSession, LoginRequest>("/auth/login", {
      email: normalizeEmail(credentials.email),
      password: credentials.password,
    });
  },

  async register(user) {
    try {
      const createdUser = await apiClient.post<AuthUser, RegisterUserRequest>(
        "/auth/register",
        {
          ...user,
          email: normalizeEmail(user.email),
        },
      );

      return {
        ok: true,
        reason: null,
        user: createdUser,
      };
    } catch (error) {
      /*
       * Se mantiene esta traduccion temporal hasta conocer
       * el contrato real de errores del backend.
       */
      if (error instanceof ApiError && error.code === "VALIDATION_ERROR") {
        return {
          ok: false,
          reason: "email-exists",
        };
      }

      throw error;
    }
  },

  async updatePassword(request) {
    await apiClient.post<{ ok: boolean }, UpdatePasswordRequest>(
      "/auth/password",
      {
        email: normalizeEmail(request.email),
        password: request.password,
      },
    );

    return true;
  },
};

export const authService: AuthService = useMockApi
  ? mockAuthService
  : backendAuthService;
