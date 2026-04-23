/**
 * useRegister – calls auth API then persists token via AuthContext.signIn.
 *
 * DIP: depends on IAuthService interface, not concrete class.
 * SRP: only handles registration flow; storage is AuthContext's concern.
 */

import { useState }     from 'react';
import { AuthResponse, IAuthService, RegisterData } from '../services/auth/IAuthService';
import { useAuth }      from './useAuth';

export const useRegister = (authService: IAuthService) => {
    const { signIn }                    = useAuth();
    const [loading, setLoading]         = useState(false);
    const [error,   setError]           = useState<string | null>(null);

    const register = async (data: RegisterData): Promise<AuthResponse> => {
        setLoading(true);
        setError(null);
        try {
            const response = await authService.register(data);
            if (response.success && response.token && response.user) {
                await signIn(response.token, response.user);
            } else if (!response.success) {
                setError(response.error ?? 'Registration failed');
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

    return { register, loading, error };
};
