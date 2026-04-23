/**
 * AuthContext – single source of truth for authentication state.
 *
 * SOLID:
 *  - SRP: only manages token + user session; routing decisions live elsewhere.
 *  - DIP: depends on IStorageService & IAuthService interfaces, not concretions.
 *  - OCP: adding new session fields (e.g. refreshToken) extends the IAuthSession
 *         interface without modifying consumer components.
 */

import React, {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { IAuthService }   from '../services/auth/IAuthService';
import { IStorageService } from '../services/storage/IStorageService';
import { SecureStorageService } from '../services/storage/SecureStorageService';
import { AuthService }    from '../services/auth/AuthService';

// ── Storage key ───────────────────────────────────────────────
const TOKEN_KEY = 'authToken';

// ── Session shape ─────────────────────────────────────────────
export interface IAuthSession {
    token: string;
}

// ── Context value ─────────────────────────────────────────────
export interface IAuthContext {
    /** null = not loaded yet, '' = no session, else valid JWT */
    token: string | null;
    /** true while the initial token is being read from secure storage */
    isLoading: boolean;
    /** true when a valid token exists */
    isAuthenticated: boolean;
    /** Call after a successful API login. Persists the token. */
    signIn: (token: string) => Promise<void>;
    /** Clears token from memory and storage, optionally calls API logout. */
    signOut: () => Promise<void>;
}

// ── Default context (never reached; guarded by useAuth hook) ──
export const AuthContext = createContext<IAuthContext>({
    token: null,
    isLoading: true,
    isAuthenticated: false,
    signIn: async () => {},
    signOut: async () => {},
});

// ── Provider ──────────────────────────────────────────────────
interface AuthProviderProps {
    children: React.ReactNode;
    /** Injectable for testing; defaults to real implementations */
    storageService?: IStorageService;
    authService?: IAuthService;
}

const defaultStorage = new SecureStorageService();
const defaultAuth    = new AuthService();

export function AuthProvider({
    children,
    storageService = defaultStorage,
    authService    = defaultAuth,
}: AuthProviderProps) {
    const [token, setToken]       = useState<string | null>(null);
    const [isLoading, setLoading] = useState(true);

    // ── Bootstrap: read persisted token on app start ──────────
    useEffect(() => {
        (async () => {
            try {
                const stored = await storageService.getItem(TOKEN_KEY);
                setToken(stored ?? '');        // '' means "no session"
            } catch {
                setToken('');
            } finally {
                setLoading(false);
            }
        })();
    }, [storageService]);

    // ── signIn ────────────────────────────────────────────────
    const signIn = useCallback(async (newToken: string) => {
        await storageService.setItem(TOKEN_KEY, newToken);
        setToken(newToken);
    }, [storageService]);

    // ── signOut ───────────────────────────────────────────────
    const signOut = useCallback(async () => {
        // Best-effort API logout (ignore errors — local state clears either way)
        if (token) {
            try { await authService.logout(token); } catch { /* noop */ }
        }
        await storageService.removeItem(TOKEN_KEY);
        setToken('');
    }, [token, authService, storageService]);

    // ── Memoised value ────────────────────────────────────────
    const value = useMemo<IAuthContext>(() => ({
        token,
        isLoading,
        isAuthenticated: !!token,   // '' and null are both falsy
        signIn,
        signOut,
    }), [token, isLoading, signIn, signOut]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
