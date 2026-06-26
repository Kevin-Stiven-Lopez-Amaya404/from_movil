export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string) {
  return EMAIL_PATTERN.test(email.trim().toLowerCase());
}

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
