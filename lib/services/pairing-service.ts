import { apiConfig } from "@/lib/config/api-config";

import { PairingError, type PairingSession } from "@/lib/pairing/pairing-types";

/**
 * Contrato de pairing aislado. El backend actual aún no expone
 * DevicePairingSession, por lo que no se inventa una ruta HTTP aquí.
 */
export const pairingService = {
  async createSession(_homeId: string): Promise<PairingSession> {
    if (!apiConfig.baseUrl) {
      throw new PairingError(
        "El pairing requiere conexión con el backend.",
        "PAIRING_UNSUPPORTED",
      );
    }

    throw new PairingError(
      "El backend todavía no expone sesiones de pairing.",
      "PAIRING_UNSUPPORTED",
    );
  },
};
