import { useCallback, useState } from "react";
import { IUserService, User } from "../services/user/IUserService";

export const useProfile = (userService: IUserService) => {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(
    async (userId: string) => {
      setLoading(true);
      setError(null);
      try {
        const user = await userService.getUser(userId);
        setProfile(user);
      } catch (err: any) {
        setError(err.message ?? "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    },
    [userService],
  );

  const updateProfile = useCallback(
    async (payload: { fullName: string; bio: string }) => {
      setLoading(true);
      setError(null);
      try {
        const user = await userService.updateProfile(payload);
        setProfile(user);
        return user;
      } catch (err: any) {
        setError(err.message ?? "Failed to update profile");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userService],
  );

  const updateProfilePicture = useCallback(
    async (formData: FormData) => {
      setLoading(true);
      setError(null);
      try {
        const user = await userService.updateProfilePicture(formData);
        setProfile(user);
        return user;
      } catch (err: any) {
        setError(err.message ?? "Failed to update profile picture");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userService],
  );

  return { profile, loading, error, fetchProfile, updateProfile, updateProfilePicture };
};
