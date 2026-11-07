/** Pairing production remains unsupported until an authorized, protected provisioning path exists. */
export function shellyPairingAvailability(isDevelopmentBuild: boolean): {
  canPair: boolean;
  reason: string | null;
} {
  if (isDevelopmentBuild) return { canPair: true, reason: null };
  return {
    canPair: false,
    reason: "La vinculación de Shelly aún no está disponible en esta versión. " +
      "No se creará una sesión incompleta. La detección Bluetooth es solo de consulta.",
  };
}
