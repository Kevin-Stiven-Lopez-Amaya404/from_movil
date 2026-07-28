// Expresion regular simple para validar la estructura basica de un correo.
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida un correo normalizando espacios y mayusculas.
 */
export function isValidEmail(email: string) {
  return EMAIL_PATTERN.test(email.trim().toLowerCase());
}

/**
 * Reglas de seguridad de contrasena usadas en la pantalla de registro.
 *
 * Retorna una lista con:
 * - `label`: texto que se muestra al usuario.
 * - `passed`: indica si la contrasena cumple esa regla.
 */
export function getPasswordRules(password: string) {
  return [
    { label: "Mínimo 8 caracteres", passed: password.length >= 8 },
    {
      label: "Una mayúscula y una minúscula",
      passed: /[A-Z]/.test(password) && /[a-z]/.test(password),
    },
    { label: "Al menos un número", passed: /\d/.test(password) },
    { label: "Un símbolo especial", passed: /[^A-Za-z0-9]/.test(password) },
  ];
}
