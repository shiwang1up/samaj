/**
 * Root layout – mounts AuthProvider and the route guard.
 *
 * The guard (useProtectedRoute) lives inside the Stack so it has
 * access to the router; AuthProvider wraps everything so all
 * children can read auth state via useAuth().
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AuthProvider } from '../context/AuthContext';
import { useProtectedRoute } from '../hooks/useProtectedRoute';

export const unstable_settings = {
    initialRouteName: 'index',
};

/** Inner layout — needs to be a child of AuthProvider to use useAuth via useProtectedRoute */
function RootNavigator() {
    const { isLoading } = useProtectedRoute();

    // While the token is being read, render nothing (avoids flash of wrong screen)
    if (isLoading) return null;

    return (
        <Stack>
            <Stack.Screen name="login"    options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)"   options={{ headerShown: false }} />
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <RootNavigator />
            <StatusBar style="auto" />
        </AuthProvider>
    );
}
