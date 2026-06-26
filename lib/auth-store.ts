export type SmartHomeUser = {
  documentNumber?: string;
  documentType?: string;
  email: string;
  name: string;
  password: string;
};

const users: SmartHomeUser[] = [
  { email: "admin@smarthome.com", password: "1234", name: "Admin" },
  { email: "pepe@smarthome.com", password: "Smart123!", name: "Pepe" },
];

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function findUser(email: string) {
  const cleanEmail = normalizeEmail(email);
  return users.find((user) => user.email === cleanEmail);
}

export function registerUser(user: SmartHomeUser) {
  const cleanEmail = normalizeEmail(user.email);
  const existingUser = findUser(cleanEmail);

  if (existingUser) {
    return { ok: false, reason: "email-exists" as const };
  }

  users.push({ ...user, email: cleanEmail });
  return { ok: true, reason: null };
}

export function authenticateUser(email: string, password: string) {
  const user = findUser(email);

  if (!user || user.password !== password) {
    return null;
  }

  return user;
}

export function updateUserPassword(email: string, password: string) {
  const user = findUser(email);

  if (!user) {
    return false;
  }

  user.password = password;
  return true;
}
