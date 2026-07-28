import { apiConfig } from "@/lib/config/api-config";

import { ApiError, type ApiErrorCode } from "./api-error";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions<Body> = {
  body?: Body;
  headers?: Record<string, string>;
  token?: string;
};

function statusToErrorCode(status: number): ApiErrorCode {
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 422 || status === 400) return "VALIDATION_ERROR";
  if (status >= 500) return "SERVER_ERROR";
  return "UNKNOWN_ERROR";
}

/**
 * Cliente HTTP tipado para el backend.
 *
 * Centraliza base URL, headers, token y errores. Las pantallas no deben usar
 * `fetch` directamente; deben pasar por servicios.
 */
export class ApiClient {
  constructor(private readonly baseUrl = apiConfig.baseUrl) {}

  async get<Response>(path: string, options?: RequestOptions<never>) {
    return this.request<Response>("GET", path, options);
  }

  async post<Response, Body = unknown>(path: string, body?: Body, options?: Omit<RequestOptions<Body>, "body">) {
    return this.request<Response, Body>("POST", path, { ...options, body });
  }

  async patch<Response, Body = unknown>(path: string, body?: Body, options?: Omit<RequestOptions<Body>, "body">) {
    return this.request<Response, Body>("PATCH", path, { ...options, body });
  }

  async delete<Response>(path: string, options?: RequestOptions<never>) {
    return this.request<Response>("DELETE", path, options);
  }

  private async request<Response, Body = unknown>(
    method: HttpMethod,
    path: string,
    options?: RequestOptions<Body>,
  ): Promise<Response> {
    if (!this.baseUrl) {
      throw new ApiError("No hay URL de backend configurada.", "NETWORK_ERROR");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), apiConfig.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(options?.token ? { Authorization: `Bearer ${options.token}` } : {}),
          ...options?.headers,
        },
        body: options?.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      const payload = await response
        .json()
        .catch(() => null) as Response | { message?: string } | null;

      if (!response.ok) {
        const message =
          payload && typeof payload === "object" && "message" in payload && payload.message
            ? String(payload.message)
            : "El servidor no pudo procesar la solicitud.";

        throw new ApiError(message, statusToErrorCode(response.status), response.status);
      }

      return payload as Response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError("No se pudo conectar con el servidor.", "NETWORK_ERROR");
    } finally {
      clearTimeout(timeout);
    }
  }
}

export const apiClient = new ApiClient();
