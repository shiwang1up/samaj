import { Platform } from "react-native";
import { AuthResponse, IAuthService, RegisterData } from "./IAuthService";

export class AuthService implements IAuthService {
  private baseUrl: string;

  constructor() {
    // 10.0.2.2 is the localhost alias for Android emulator
    const host = Platform.OS === "android" ? "10.0.2.2" : "localhost";
    this.baseUrl = `http://${host}:4000/api/auth`;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || "Login failed",
        };
      }

      return {
        success: true,
        token: data.token,
      };
    } catch {
      return {
        success: false,
        error: "Network error occurred",
      };
    }
  }

  async register(registerData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || "Registration failed",
        };
      }

      return {
        success: true,
        token: data.token,
      };
    } catch {
      return {
        success: false,
        error: "Network error occurred",
      };
    }
  }
}
