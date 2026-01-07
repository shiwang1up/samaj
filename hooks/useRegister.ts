import { useState } from "react";
import {
  AuthResponse,
  IAuthService,
  RegisterData,
} from "../services/auth/IAuthService";

export const useRegister = (authService: IAuthService) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const register = async (data: RegisterData): Promise<AuthResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(data);
      if (response.success && response.token) {
        setToken(response.token);
        console.log("Registration successful:", response.token);
      } else {
        setError(response.error || "Registration failed");
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
    register,
    loading,
    error,
    token,
  };
};
