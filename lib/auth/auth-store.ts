import {
  authService,
  normalizeEmail,
  type AuthUser,
  type RegisterUserRequest,
} from "@/lib/services/auth-service";

export type SmartHomeUser = AuthUser & {
  password: string;
};

export { normalizeEmail };

/**
 * Fachada de autenticacion usada por las pantallas.
 *
 * Hoy delega al servicio mock local. Cuando exista backend, `authService`
 * usara HTTP automaticamente si `EXPO_PUBLIC_API_URL` esta configurada.
 */
export async function registerUser(user: RegisterUserRequest) {
  return authService.register(user);
}

export async function authenticateUser(email: string, password: string) {
  const session = await authService.login({ email: normalizeEmail(email), password });
  return session?.user ?? null;
}

export async function updateUserPassword(email: string, password: string) {
  return authService.updatePassword({ email: normalizeEmail(email), password });
}
