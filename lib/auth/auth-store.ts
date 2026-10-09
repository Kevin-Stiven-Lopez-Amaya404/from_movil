import {
  authService,
  normalizeEmail,
  type AuthSession,
  type ChangePasswordRequest,
  type ReactivateAccountResponse,
  type RegisterUserRequest,
  type RequestAccountReactivationResponse,
} from "@/lib/services/auth-service";

export { normalizeEmail };

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

export async function activateUserAccount(token: string): Promise<void> {
  await authService.activateAccount(token);
}

export async function requestAccountReactivation(
  email: string,
): Promise<RequestAccountReactivationResponse> {
  return authService.requestAccountReactivation(normalizeEmail(email));
}

export async function reactivateUserAccount(
  token: string,
): Promise<ReactivateAccountResponse> {
  return authService.reactivateAccount(token);
}

export async function requestPasswordReset(email: string): Promise<void> {
  await authService.requestPasswordReset(normalizeEmail(email));
}

export async function resetUserPassword(
  token: string,
  password: string,
  passwordConfirmation: string,
): Promise<void> {
  await authService.resetPassword({
    token,
    password,
    passwordConfirmation,
  });
}

export async function changeUserPassword(
  currentPassword: string,
  newPassword: string,
  newPasswordConfirmation: string,
): Promise<void> {
  const request: ChangePasswordRequest = {
    currentPassword,
    newPassword,
    newPasswordConfirmation,
  };

  await authService.changePassword(request);
}

export async function logoutUser(allSessions = false): Promise<void> {
  await authService.logout(allSessions);
}
