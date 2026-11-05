// ======================================================
// VALIDACIÓN DE CORREO
// ======================================================

/**
 * Expresión regular simple para validar la estructura
 * básica de un correo electrónico.
 */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida un correo normalizando espacios y mayúsculas.
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim().toLowerCase());
}

// ======================================================
// VALIDACIÓN DE CONTRASEÑA
// ======================================================

export type PasswordRule = {
  label: string;
  passed: boolean;
};

/**
 * Reglas de seguridad de contraseña utilizadas
 * en Registro y Recuperación de contraseña.
 *
 * Reglas:
 * - Mínimo 8 caracteres.
 * - Una mayúscula y una minúscula.
 * - Al menos un número.
 * - Un símbolo especial.
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
