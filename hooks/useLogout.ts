/**
 * useLogout – calls AuthContext.signOut which handles both API logout
 * and secure storage cleanup in one atomic operation.
 *
 * SRP: callers only need to trigger logout; they don't manage storage.
 * DIP: no longer depends on IStorageService — that's AuthContext's concern.
 */

import { useState } from 'react';
import { useAuth }  from './useAuth';

export const useLogout = () => {
    const { signOut }                   = useAuth();
    const [loading, setLoading]         = useState(false);
    const [error,   setError]           = useState<string | null>(null);

    const logout = async () => {
        setLoading(true);
        setError(null);
        try {
            await signOut();
        } catch {
            setError('An error occurred during logout');
        } finally {
            setLoading(false);
        }
    };

    return { logout, loading, error };
};
