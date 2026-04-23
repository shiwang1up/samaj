/**
 * apiClient – production Axios instance for the Samaj API.
 *
 * Responsibilities (SRP split across this file):
 *  1. Single configured Axios instance (base URL, timeout, default headers).
 *  2. Request interceptor  → injects Bearer token automatically.
 *  3. Response interceptor → normalises all API errors into a plain Error
 *     with the server's message, so callers never have to inspect AxiosError.
 *
 * Token management:
 *  Call setAuthToken(token) from AuthContext after sign-in / sign-out.
 *  The interceptor picks it up on every subsequent request.
 *
 * Why Axios over fetch/XHR:
 *  - Uses the native networking layer (no Blob/FileReader pipeline).
 *  - First-class interceptor support — clean place for cross-cutting concerns.
 *  - Built-in timeout, JSON serialisation, and typed responses.
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { Config } from "../../constants/Config";

// ── Custom error ──────────────────────────────────────────────
/**
 * ApiError wraps a server error and retains the HTTP status code
 * so callers can make informed decisions (e.g. treat 409 as non-fatal)
 * without coupling to Axios internals.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ── Token store ───────────────────────────────────────────────
// A module-level mutable ref keeps the token out of the Axios
// instance itself so it can be updated without re-creating the client.
let _authToken: string | null = null;

/** Call this from AuthContext whenever the session token changes. */
export const setAuthToken = (token: string | null): void => {
  _authToken = token;
};

// ── Axios instance ────────────────────────────────────────────
export const apiClient = axios.create({
  baseURL: Config.BASE_URL,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request interceptor — inject Bearer token ─────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (_authToken) {
      config.headers.Authorization = `Bearer ${_authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor — normalise errors ───────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    // Server responded with a non-2xx status
    if (error.response) {
      const serverMessage =
        error.response.data?.message ??
        error.response.data?.error ??
        `Request failed with status ${error.response.status}`;
      return Promise.reject(new ApiError(serverMessage, error.response.status));
    }

    // Request was made but no response (timeout, DNS failure, etc.)
    if (error.request) {
      return Promise.reject(new ApiError("Network error — check your connection.", 0));
    }

    // Anything else (bad config, etc.)
    return Promise.reject(new ApiError(error.message ?? "An unexpected error occurred.", 0));
  },
);
