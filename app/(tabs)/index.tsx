import { useRouter } from 'expo-router';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useLogout } from '../../hooks/useLogout';
import { AuthService } from '../../services/auth/AuthService';
import { SecureStorageService } from '../../services/storage/SecureStorageService';

const authService = new AuthService();
const storageService = new SecureStorageService();

export default function HomeScreen() {
    const { theme } = useUnistyles();
    const router = useRouter();
    const { logout, loading } = useLogout(authService, storageService);

    const handleLogout = async () => {
        await logout();
        router.replace('/login');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome Home</Text>
            <Text style={styles.subtitle}>You are now logged in.</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={handleLogout}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color={theme.colors.activeTint} />
                ) : (
                    <Text style={styles.buttonText}>Log Out</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        gap: theme.gap(2),
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.typography,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.dimmed,
    },
    button: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: theme.colors.tint,
        borderRadius: 8,
        marginTop: 20,
    },
    buttonText: {
        color: theme.colors.activeTint,
        fontWeight: '600',
    },
}));
