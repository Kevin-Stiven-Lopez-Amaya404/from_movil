import { apiConfig } from "@/lib/config/api-config";

import { ApiError, type ApiErrorCode } from "./api-error";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions<Body> = {
  body?: Body;
  headers?: Record<string, string>;
  token?: string;
};

type ErrorPayload = {
  message?: string;
};

function statusToErrorCode(status: number): ApiErrorCode {
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 400 || status === 422) return "VALIDATION_ERROR";
  if (status >= 500) return "SERVER_ERROR";

  return "UNKNOWN_ERROR";
}

/**
 * Cliente HTTP tipado para el backend.
 *
 * Centraliza:
 * - URL base
 * - método HTTP
 * - headers
 * - token Bearer
 * - timeout
 * - transformación de errores HTTP a ApiError
 *
 * Las pantallas no deben utilizar fetch directamente.
 * Las peticiones deben pasar por los servicios.
 */
export class ApiClient {
  constructor(private readonly baseUrl = apiConfig.baseUrl) {}

  async get<Response>(
    path: string,
    options?: RequestOptions<never>,
  ): Promise<Response> {
    return this.request<Response>("GET", path, options);
  }

  async post<Response, Body = unknown>(
    path: string,
    body?: Body,
    options?: Omit<RequestOptions<Body>, "body">,
  ): Promise<Response> {
    return this.request<Response, Body>("POST", path, {
      ...options,
      body,
    });
  }

  async put<Response, Body = unknown>(
    path: string,
    body?: Body,
    options?: Omit<RequestOptions<Body>, "body">,
  ): Promise<Response> {
    return this.request<Response, Body>("PUT", path, {
      ...options,
      body,
    });
  }

  async patch<Response, Body = unknown>(
    path: string,
    body?: Body,
    options?: Omit<RequestOptions<Body>, "body">,
  ): Promise<Response> {
    return this.request<Response, Body>("PATCH", path, {
      ...options,
      body,
    });
  }

  async delete<Response>(
    path: string,
    options?: RequestOptions<never>,
  ): Promise<Response> {
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

    const timeout = setTimeout(() => {
      controller.abort();
    }, apiConfig.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(options?.token
            ? {
                Authorization: `Bearer ${options.token}`,
              }
            : {}),
          ...options?.headers,
        },
        body:
          options?.body !== undefined
            ? JSON.stringify(options.body)
            : undefined,
        signal: controller.signal,
      });

      /*
       * Algunas respuestas HTTP pueden no tener cuerpo,
       * por ejemplo 204 No Content.
       */
      const payload = (await response.json().catch(() => null)) as
        | Response
        | ErrorPayload
        | null;

      if (!response.ok) {
        const message =
          payload &&
          typeof payload === "object" &&
          "message" in payload &&
          payload.message
            ? String(payload.message)
            : "El servidor no pudo procesar la solicitud.";

        throw new ApiError(
          message,
          statusToErrorCode(response.status),
          response.status,
        );
      }

      return payload as Response;
    } catch (error) {
      /*
       * Los errores que nosotros mismos transformamos deben
       * conservar su código y status.
       */
      if (error instanceof ApiError) {
        throw error;
      }

      /*
       * fetch puede fallar por:
       * - pérdida de conexión
       * - timeout
       * - DNS
       * - servidor inaccesible
       * - AbortController
       *
       * En todos estos casos la capa superior recibe
       * un NETWORK_ERROR.
       */
      throw new ApiError(
        "No se pudo conectar con el servidor.",
        "NETWORK_ERROR",
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}

export const apiClient = new ApiClient();
