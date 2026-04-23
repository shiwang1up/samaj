import { useCallback, useState } from "react";
import { IUserService, User } from "../services/user/IUserService";
import { UserService } from "../services/user/UserService";

export const useSearchUsers = (
  userService: IUserService = new UserService()
) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchUsers = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setUsers([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await userService.searchUsers(query);
        setUsers(response.users);
      } catch (err: any) {
        setError(err.message || "Failed to search users");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    },
    [userService]
  );

  return {
    users,
    loading,
    error,
    searchUsers,
  };
};
