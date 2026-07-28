export type ApiErrorCode =
  | "NETWORK_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "SERVER_ERROR"
  | "UNKNOWN_ERROR";

export class ApiError extends Error {
  code: ApiErrorCode;
  status?: number;

  constructor(message: string, code: ApiErrorCode = "UNKNOWN_ERROR", status?: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

export function getApiErrorMessage(error: unknown, fallback = "No se pudo completar la solicitud.") {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}
