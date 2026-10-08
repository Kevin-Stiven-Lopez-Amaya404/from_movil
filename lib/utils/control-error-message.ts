type ApiErrorLike = {
  message?: unknown;
  status?: unknown;
  statusCode?: unknown;
  response?: {
    status?: unknown;
    data?: {
      message?: unknown;
    };
  };
};

export function getDeviceControlErrorMessage(error: unknown): string {
  const value =
    error && typeof error === "object"
      ? (error as ApiErrorLike)
      : undefined;

  const status =
    value?.status ??
    value?.statusCode ??
    value?.response?.status;

  const message =
    error instanceof Error
      ? error.message
      : typeof value?.response?.data?.message === "string"
        ? value.response.data.message
        : typeof value?.message === "string"
          ? value.message
          : "";

  if (status === 401 || /\b401\b|unauthorized|no autenticado/i.test(message)) {
    return "Tu sesión no está autorizada o expiró. Inicia sesión nuevamente.";
  }

  if (
    status === 403 ||
    /\b403\b|forbidden|access[\s_-]*denied|permission denied|no tienes permiso|sin permisos/i.test(
      message,
    )
  ) {
    return "Tu rol no permite controlar este dispositivo. OWNER y MEMBER pueden controlarlo; GUEST solo puede consultarlo.";
  }

  return message || "No se pudo cambiar el estado. Intenta nuevamente.";
}
