import {
    authService,
    loginDemoAccount,
    normalizeEmail,
    type RegisterUserRequest,
} from "@/lib/services/auth-service";
import {
    saveSession,
    setDemoSession,
    type StoredSession,
} from "@/lib/session/session-store";

export { normalizeEmail };

export async function registerUser(user: RegisterUserRequest) {
  return authService.register(user);
}

export async function authenticateUser(email: string, password: string) {
  const session = await authService.login({
    email: normalizeEmail(email),
    password,
  });

  if (!session) return null;

  const accessToken = session.accessToken ?? session.token;
  if (accessToken) {
    const storedSession: StoredSession = {
      accessToken,
      refreshToken: session.refreshToken,
      sessionVersion: session.sessionVersion,
      expiresAt: session.expiresAt,
      user: session.user,
    };
    await saveSession(storedSession);
  }

  return session.user;
}

export async function authenticateDemoUser() {
  const session = await loginDemoAccount();
  if (!session) return null;

  const accessToken = session.accessToken ?? session.token;
  if (!accessToken) return null;

  const demoSession: StoredSession = {
    accessToken,
    user: session.user,
    mode: "demo",
  };
  await setDemoSession(demoSession);

  return session.user;
}

export function activateUserAccount(token: string) {
  return authService.activateAccount(token);
}

export function resendActivationEmail(email: string) {
  return authService.resendActivation(normalizeEmail(email));
}

export function requestPasswordReset(email: string) {
  return authService.requestPasswordReset(normalizeEmail(email));
}

export function resetUserPassword(
  token: string,
  password: string,
  passwordConfirmation: string,
) {
  return authService.resetPassword({
    token,
    password,
    passwordConfirmation,
  });
}

export function changeUserPassword(
  currentPassword: string,
  newPassword: string,
  newPasswordConfirmation: string,
) {
  return authService.changePassword({
    currentPassword,
    newPassword,
    newPasswordConfirmation,
  });
}

export async function logoutUser(allSessions = false) {
  return authService.logout(allSessions);
}
