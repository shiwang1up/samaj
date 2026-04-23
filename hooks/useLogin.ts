import { useState } from "react";
import { AuthResponse, IAuthService } from "../services/auth/IAuthService";
import { IStorageService } from "../services/storage/IStorageService";

export const useLogin = (
  authService: IAuthService,
  storageService: IStorageService
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = async (
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);
      if (response.success && response.token) {
        setToken(response.token);
        await storageService.setItem("authToken", response.token);
        // console.log("Login successful, token saved:", response.token);
      } else {
        setError(response.error || "Login failed");
      }
      return response;
    } catch {
      setError("An unexpected error occurred");
      return { success: false, error: "An unexpected error occurred" };
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    loading,
    error,
    token,
  };
};
