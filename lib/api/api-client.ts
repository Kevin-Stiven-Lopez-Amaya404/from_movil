import { apiConfig } from "@/lib/config/api-config";
import {
    clearSession,
    getAccessToken,
    loadSession,
    refreshSession,
} from "@/lib/session/session-store";

import { ApiError, type ApiErrorCode } from "./api-error";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions<Body> = {
  body?: Body;
  headers?: Record<string, string>;
  token?: string;
  skipAuthRefresh?: boolean;
};

type ErrorPayload = {
  message?: string | string[];
};

function statusToErrorCode(status: number): ApiErrorCode {
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 409) return "CONFLICT";
  if (status === 400 || status === 422) return "VALIDATION_ERROR";
  if (status >= 500) return "SERVER_ERROR";

  return "UNKNOWN_ERROR";
}

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
    const timeout = setTimeout(() => controller.abort(), apiConfig.timeoutMs);
    const storedSession = options?.token ? null : await loadSession();
    const accessToken =
      options?.token ?? storedSession?.accessToken ?? getAccessToken();
    const apiRootPrefix = "/api/v1";
    const requestPath =
      this.baseUrl.endsWith(apiRootPrefix) &&
      path.startsWith(`${apiRootPrefix}/`)
        ? path.slice(apiRootPrefix.length)
        : path;

    try {
      const response = await fetch(`${this.baseUrl}${requestPath}`, {
        method,
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          ...options?.headers,
        },
        body:
          options?.body !== undefined
            ? JSON.stringify(options.body)
            : undefined,
        signal: controller.signal,
      });

      const payload = (await response.json().catch(() => null)) as
        | Response
        | ErrorPayload
        | null;

      if (!response.ok) {
        if (
          response.status === 401 &&
          !options?.skipAuthRefresh &&
          path !== "/api/v1/auth/refresh"
        ) {
          let nextSession;
          try {
            nextSession = await refreshSession();
          } catch (refreshError) {
            await clearSession();
            throw refreshError;
          }

          if (nextSession) {
            return this.request<Response, Body>(method, path, {
              ...options,
              token: nextSession.accessToken,
              skipAuthRefresh: true,
            });
          }

          await clearSession();
        }

        const message =
          payload &&
          typeof payload === "object" &&
          "message" in payload &&
          payload.message
            ? Array.isArray(payload.message)
              ? payload.message.join(" ")
              : payload.message
            : "El servidor no pudo procesar la solicitud.";

        throw new ApiError(
          message,
          statusToErrorCode(response.status),
          response.status,
        );
      }

      return payload as Response;
    } catch (error) {
      if (error instanceof ApiError) throw error;

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
