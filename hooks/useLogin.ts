import { useState } from "react";
import { IAuthService } from "../services/auth/IAuthService";

export const useLogin = (authService: IAuthService) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(username, password);
      if (response.success && response.token) {
        setToken(response.token);
        // In a real app, you might store this in AsyncStorage or Context
        console.log("Login successful:", response.token);
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
