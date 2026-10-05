import {
  authService,
  normalizeEmail,
  type AuthSession,
  type RegisterUserRequest,
} from "@/lib/services/auth-service";

export { normalizeEmail };

/**
 * Fachada de autenticacion usada por las pantallas.
 *
 * Delega al servicio mock local cuando no hay backend configurado
 * y al servicio HTTP cuando EXPO_PUBLIC_API_URL existe.
 */
export async function registerUser(user: RegisterUserRequest) {
  return authService.register(user);
}

export async function authenticateUser(
  email: string,
  password: string,
): Promise<AuthSession | null> {
  return authService.login({
    email: normalizeEmail(email),
    password,
  });
}

export async function updateUserPassword(email: string, password: string) {
  return authService.updatePassword({
    email: normalizeEmail(email),
    password,
  });
}
