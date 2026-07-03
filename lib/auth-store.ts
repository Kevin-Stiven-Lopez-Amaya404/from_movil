export type SmartHomeUser = {
  documentNumber?: string;
  documentType?: string;
  email: string;
  name: string;
  password: string;
};

/**
 * Usuarios en memoria para simular autenticacion.
 *
 * Importante para sustentacion:
 * esta no es una base de datos real. Los datos viven mientras la app esta
 * ejecutandose y se perderian al reiniciar el proceso.
 */
const users: SmartHomeUser[] = [
  { email: "admin@smarthome.com", password: "1234", name: "Admin" },
  { email: "pepe@smarthome.com", password: "Smart123!", name: "Pepe" },
];

/**
 * Normaliza correos para comparar sin errores por espacios o mayusculas.
 */
export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

/**
 * Busca un usuario por correo dentro del arreglo local.
 */
export function findUser(email: string) {
  const cleanEmail = normalizeEmail(email);
  return users.find((user) => user.email === cleanEmail);
}

/**
 * Registra un usuario en memoria.
 *
 * Retorna `ok: false` si el correo ya existe. Este patron evita lanzar errores
 * y facilita que la pantalla decida que mensaje mostrar.
 */
export function registerUser(user: SmartHomeUser) {
  const cleanEmail = normalizeEmail(user.email);
  const existingUser = findUser(cleanEmail);

  if (existingUser) {
    return { ok: false, reason: "email-exists" as const };
  }

  users.push({ ...user, email: cleanEmail });
  return { ok: true, reason: null };
}

/**
 * Valida credenciales contra los usuarios simulados.
 *
 * En produccion esta funcion se reemplazaria por una llamada a backend.
 */
export function authenticateUser(email: string, password: string) {
  const user = findUser(email);

  if (!user || user.password !== password) {
    return null;
  }

  return user;
}

/**
 * Actualiza la contrasena de un usuario existente en memoria.
 *
 * Retorna `false` si el email no pertenece a ningun usuario.
 */
export function updateUserPassword(email: string, password: string) {
  const user = findUser(email);

  if (!user) {
    return false;
  }

  user.password = password;
  return true;
}
