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
    useState} from 'react';

import { IAuthService, AuthUser }   from '../services/auth/IAuthService';
import { IStorageService } from '../services/storage/IStorageService';
import { SecureStorageService } from '../services/storage/SecureStorageService';
import { AuthService }    from '../services/auth/AuthService';
import { setAuthToken }   from '../services/http/apiClient';

// ── Storage key ───────────────────────────────────────────────
const TOKEN_KEY = 'authToken';
const USER_KEY  = 'authUser';

// ── Session shape ─────────────────────────────────────────────
export interface IAuthSession {
    token: string;
}

// ── Context value ─────────────────────────────────────────────
export interface IAuthContext {
    /** null = not loaded yet, '' = no session, else valid JWT */
    token: string | null;
    /** The authenticated user's details */
    user: AuthUser | null;
    /** true while the initial token is being read from secure storage */
    isLoading: boolean;
    /** true when a valid token exists */
    isAuthenticated: boolean;
    /** Call after a successful API login. Persists the token and user. */
    signIn: (token: string, user: AuthUser) => Promise<void>;
    /** Clears token from memory and storage, optionally calls API logout. */
    signOut: () => Promise<void>;
}

// ── Default context (never reached; guarded by useAuth hook) ──
export const AuthContext = createContext<IAuthContext>({
    token: null,
    user: null,
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
    const [user, setUser]         = useState<AuthUser | null>(null);
    const [isLoading, setLoading] = useState(true);

    // ── Bootstrap: read persisted token on app start ──────────
    useEffect(() => {
        (async () => {
            try {
                const storedToken = await storageService.getItem(TOKEN_KEY);
                const storedUser  = await storageService.getItem(USER_KEY);
                const resolvedToken = storedToken ?? '';
                const resolvedUser  = storedUser ? JSON.parse(storedUser) as AuthUser : null;
                
                setToken(resolvedToken);
                setUser(resolvedUser);
                if (resolvedToken) setAuthToken(resolvedToken); // restore interceptor on cold start
            } catch {
                setToken('');
                setUser(null);
            } finally {
                setLoading(false);
            }
        })();
    }, [storageService]);

    // ── signIn ────────────────────────────────────────────────
    const signIn = useCallback(async (newToken: string, newUser: AuthUser) => {
        await storageService.setItem(TOKEN_KEY, newToken);
        await storageService.setItem(USER_KEY, JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        setAuthToken(newToken);           // keep Axios interceptor in sync
    }, [storageService]);

    // ── signOut ───────────────────────────────────────────────
    const signOut = useCallback(async () => {
        const currentToken = token;
        // Revoke Axios token first so no in-flight requests after this use it
        setAuthToken(null);
        setToken('');
        setUser(null);
        await storageService.removeItem(TOKEN_KEY);
        await storageService.removeItem(USER_KEY);
        
        // Best-effort API logout — local state is already cleared above
        if (currentToken) {
            try { await authService.logout(currentToken); } catch { /* noop */ }
        }
    }, [token, authService, storageService]);

    // ── Memoised value ────────────────────────────────────────
    const value = useMemo<IAuthContext>(() => ({
        token,
        user,
        isLoading,
        isAuthenticated: !!token,   // '' and null are both falsy
        signIn,
        signOut,
    }), [token, user, isLoading, signIn, signOut]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
