import {
    PairingError,
    type PairingSession,
    type PairingSessionStatus,
} from "./pairing-types";

const transitions: Record<PairingSessionStatus, PairingSessionStatus[]> = {
  PENDING: ["DEVICE_IDENTIFIED", "EXPIRED", "CANCELLED", "FAILED"],
  DEVICE_IDENTIFIED: ["BROKER_CONFIGURED", "EXPIRED", "CANCELLED", "FAILED"],
  BROKER_CONFIGURED: ["CONNECTED", "EXPIRED", "CANCELLED", "FAILED"],
  CONNECTED: ["COMPLETED", "EXPIRED", "CANCELLED", "FAILED"],
  COMPLETED: [],
  EXPIRED: [],
  CANCELLED: [],
  FAILED: [],
};

export function transitionPairingSession(
  session: PairingSession,
  status: PairingSessionStatus,
  changes: Partial<PairingSession> = {},
): PairingSession {
  if (!transitions[session.status].includes(status)) {
    throw new PairingError(
      `No se puede pasar de ${session.status} a ${status}.`,
      "INVALID_STATE",
    );
  }

  return { ...session, ...changes, status };
}
