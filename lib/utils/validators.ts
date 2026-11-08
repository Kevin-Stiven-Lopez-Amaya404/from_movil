// ======================================================
// EMAIL VALIDATION
// ======================================================

/**
 * Simple regular expression to validate the basic
 * structure of an email address.
 */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates an email after normalizing spaces and case.
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim().toLowerCase());
}

// ======================================================
// PASSWORD VALIDATION
// ======================================================

export type PasswordRule = {
  label: string;
  passed: boolean;
};

/**
 * Password security rules used
 * in Registration and Password Recovery.
 *
 * Rules:
 * - At least 8 characters.
 * - One uppercase and one lowercase letter.
 * - At least one number.
 * - One special symbol.
 */
export function getPasswordRules(password: string): PasswordRule[] {
  return [
    {
      label: "Mínimo 8 caracteres",
      passed: password.length >= 8,
    },
    {
      label: "Una mayúscula y una minúscula",
      passed: /[A-Z]/.test(password) && /[a-z]/.test(password),
    },
    {
      label: "Al menos un número",
      passed: /\d/.test(password),
    },
    {
      label: "Un símbolo especial",
      passed: /[^A-Za-z0-9]/.test(password),
    },
  ];
}
