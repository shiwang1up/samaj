/**
 * useAuth – typed consumer hook for AuthContext.
 *
 * Throws if used outside <AuthProvider>, making misconfiguration
 * immediately obvious instead of producing silent undefined errors.
 */

import { useContext } from 'react';
import { AuthContext, type IAuthContext } from '../context/AuthContext';

export function useAuth(): IAuthContext {
    const ctx = useContext(AuthContext);
    if (ctx === undefined) {
        throw new Error('useAuth must be used inside <AuthProvider>');
    }
    return ctx;
}
