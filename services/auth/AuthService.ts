/**
 * AuthService – HTTP implementation of IAuthService.
 *
 * SOLID:
 *  SRP : only maps auth API responses to the IAuthService contract.
 *  OCP : add methods (refreshToken, verifyOtp…) without touching existing ones.
 *  LSP : fully satisfies IAuthService — drop-in replaceable.
 *  DIP : depends on apiClient (interface-level abstraction), not raw HTTP.
 *
 * Note: login and register are intentionally called without a token.
 *       The interceptor only injects a token if one is set, so these
 *       calls are naturally unauthenticated.
 */

import { apiClient } from "../http/apiClient";
import { AuthResponse, IAuthService, RegisterData, AuthUser } from "./IAuthService";

export class AuthService implements IAuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data } = await apiClient.post<AuthUser & { token: string }>("/auth/login", {
        email,
        password,
      });
      return { success: true, token: data.token, user: data };
    } catch (error: any) {
      console.error("AuthService.login:", error.message);
      return { success: false, error: error.message ?? "Login failed" };
    }
  }

  async register(registerData: RegisterData): Promise<AuthResponse> {
    try {
      const { data } = await apiClient.post<AuthUser & { token: string }>(
        "/auth/register",
        registerData,
      );
      return { success: true, token: data.token, user: data };
    } catch (error: any) {
      console.error("AuthService.register:", error.message);
      return { success: false, error: error.message ?? "Registration failed" };
    }
  }

  async logout(token: string): Promise<AuthResponse> {
    try {
      // Token is passed explicitly here because sign-out clears _authToken
      // in AuthContext *before* calling this method, so the interceptor
      // might not have it anymore. Belt-and-suspenders approach.
      await apiClient.post(
        "/auth/logout",
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return { success: true };
    } catch (error: any) {
      console.error("AuthService.logout:", error.message);
      // Logout errors are non-fatal — local state is cleared either way.
      return { success: true };
    }
  }
}
