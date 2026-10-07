export type UserRole = "admin" | "miembro" | "invitado";

export type ActiveDevice = {
  id: string;
  name: string;
  lastAccess: string;
  verified: boolean;
};