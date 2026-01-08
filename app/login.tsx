import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useLogin } from '../hooks/useLogin';
import { AuthService } from '../services/auth/AuthService';
import { SecureStorageService } from '../services/storage/SecureStorageService';

const authService = new AuthService();
const storageService = new SecureStorageService();

export default function LoginScreen() {
    const router = useRouter();
    const { theme } = useUnistyles();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error } = useLogin(authService, storageService);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password.');
            return;
        }
        const result = await login(email, password);
        if (result.success) {
            Alert.alert('Success', 'Logged in successfully!', [
                { text: 'OK', onPress: () => router.replace("/(tabs)") }
            ]);
        }
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <View style={styles.contentContainer}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>
                        Sign in to continue
                    </Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            placeholderTextColor={theme.colors.placeholder}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            placeholderTextColor={theme.colors.placeholder}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    {error && <Text style={styles.errorText}>{error}</Text>}

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleLogin}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color={theme.colors.activeTint} />
                        ) : (
                            <Text style={styles.buttonText}>Log In</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Don&apos;t have an account?{' '}
                            <Text style={styles.link} onPress={() => router.push("/register")}>Sign Up</Text>
                        </Text>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </>
    );
}

const styles = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
        backgroundColor: theme.colors.background,
    },
    contentContainer: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
        paddingBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: theme.gap(1),
        textAlign: 'left',
        color: theme.colors.typography,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: theme.gap(5),
        textAlign: 'left',
        color: theme.colors.placeholder,
    },
    inputContainer: {
        marginBottom: theme.gap(2.5),
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: theme.gap(1),
        color: theme.colors.typography,
    },
    input: {
        height: 52,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: theme.colors.typography,
        borderColor: theme.colors.dimmed,
        backgroundColor: theme.colors.background,
    },
    button: {
        height: 52,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        backgroundColor: theme.colors.tint,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: theme.colors.activeTint,
        fontSize: 16,
        fontWeight: '600',
    },
    errorText: {
        color: theme.colors.accents.apple,
        marginBottom: 20,
        textAlign: 'center',
    },
    footer: {
        marginTop: 24,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: theme.colors.placeholder,
    },
    link: {
        fontWeight: '600',
        color: theme.colors.tint,
    }
}));
