/**
 * useSearchUsers – manages the user-search async flow.
 *
 * SOLID:
 *  SRP: only responsible for the search-users flow (loading / error / data).
 *  DIP: depends on IUserService interface, not the concrete UserService class.
 *       The caller (screen) injects the service, making this hook testable
 *       with any mock that satisfies IUserService.
 */

import { useCallback, useState } from "react";
import { IUserService, User } from "../services/user/IUserService";

export const useSearchUsers = (userService: IUserService) => {
  const [users, setUsers]   = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const searchUsers = useCallback(
    async (query: string, token: string) => {
      if (!query.trim()) {
        setUsers([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await userService.searchUsers(query, token);
        setUsers(response.users);
      } catch (err: any) {
        setError(err.message ?? "Failed to search users");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    },
    [userService],
  );

  return { users, loading, error, searchUsers };
};
