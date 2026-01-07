import { IAuthService, LoginResponse } from "./IAuthService";

export class DummyAuthService implements IAuthService {
  async login(username: string, password: string): Promise<LoginResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (username === "user" && password === "password") {
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
}
