/**
 * useProtectedRoute – navigation guard hook.
 *
 * SRP: routing decisions live here, not scattered across screens.
 *
 * Rules:
 *  - While loading: render nothing (splash behaviour).
 *  - Unauthenticated + on a protected route → redirect to /login.
 *  - Authenticated + on an auth route (/login, /register) → redirect to /(tabs).
 */

import { useSegments, useRouter } from 'expo-router';
import { useEffect }              from 'react';
import { useAuth }                from './useAuth';

/** Route segments that are accessible WITHOUT authentication */
const PUBLIC_SEGMENTS = ['login', 'register'] as const;

type PublicSegment = (typeof PUBLIC_SEGMENTS)[number];

function isPublicSegment(seg: string): seg is PublicSegment {
    return (PUBLIC_SEGMENTS as readonly string[]).includes(seg);
}

export function useProtectedRoute() {
    const { isAuthenticated, isLoading } = useAuth();
    const segments = useSegments();
    const router   = useRouter();

    useEffect(() => {
        if (isLoading) return;   // wait until token is read from storage

        const firstSegment  = segments[0] ?? '';
        const onPublicRoute = isPublicSegment(firstSegment) || (firstSegment as string) === '';

        if (!isAuthenticated && !onPublicRoute) {
            // Protected route accessed without a token → bounce to login
            router.replace('/login');
        } else if (isAuthenticated && onPublicRoute) {
            // Already authenticated → skip auth screens
            router.replace('/(tabs)');
        }
    }, [isAuthenticated, isLoading, segments, router]);

    return { isLoading };
}
