/**
 * useLogin – calls auth API then persists the token via AuthContext.signIn.
 *
 * SRP: only responsible for the login flow.
 * DIP: depends on IAuthService interface, not the concrete AuthService class.
 */

import { useState }        from 'react';
import { IAuthService }    from '../services/auth/IAuthService';
import { useAuth }         from './useAuth';

export const useLogin = (authService: IAuthService) => {
    const { signIn }                    = useAuth();
    const [loading, setLoading]         = useState(false);
    const [error,   setError]           = useState<string | null>(null);

    const login = async (email: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authService.login(email, password);
            if (response.success && response.token && response.user) {
                // Persist token, user, and update global auth state in one call
                await signIn(response.token, response.user);
            } else {
                setError(response.error ?? 'Login failed');
            }
            return response;
        } catch {
            const msg = 'An unexpected error occurred';
            setError(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    };

    return { login, loading, error };
};
