import { useState } from "react";
import { IAuthService } from "../services/auth/IAuthService";
import { IStorageService } from "../services/storage/IStorageService";

export const useLogout = (
  authService: IAuthService,
  storageService: IStorageService
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await storageService.getItem("authToken");
      if (token) {
        await authService.logout(token);
      }
      // Always remove the token from storage, even if the API call fails
      await storageService.removeItem("authToken");
    } catch {
      setError("An error occurred during logout");
    } finally {
      setLoading(false);
    }
  };

  return {
    logout,
    loading,
    error,
  };
};
