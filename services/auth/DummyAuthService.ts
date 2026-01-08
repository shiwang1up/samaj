import { AuthResponse, IAuthService, RegisterData } from "./IAuthService";

export class DummyAuthService implements IAuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email === "tonystark@gmail.com" && password === "aam ka achaar") {
          resolve({
            success: true,
            token: "dummy-jwt-token-123456",
          });
        } else {
          resolve({
            success: false,
            error: "Invalid username or password",
          });
        }
      }, 1000); // Simulate network delay
    });
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          token: "dummy-registered-token-987654",
        });
      }, 1000);
    });
  }

  async logout(token: string): Promise<AuthResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
        });
      }, 500);
    });
  }
}
