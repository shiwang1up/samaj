import { Config } from "../../constants/Config";
import { AuthResponse, IAuthService, RegisterData } from "./IAuthService";

export class AuthService implements IAuthService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = Config.API_BASE_URL;
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
    } catch (error) {
      console.error("AuthService login failed:", error);
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
    } catch (error) {
      console.error("AuthService register failed:", error);
      return {
        success: false,
        error: "Network error occurred",
      };
    }
  }

  async logout(token: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || "Logout failed",
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error("AuthService logout failed:", error);
      return {
        success: false,
        error: "Network error occurred",
      };
    }
  }
}
