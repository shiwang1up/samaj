import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useRegister } from '../hooks/useRegister';
import { AuthService } from '../services/auth/AuthService';
import { SecureStorageService } from '../services/storage/SecureStorageService';

const authService = new AuthService();
const storageService = new SecureStorageService();

export default function RegisterScreen() {
    const { theme } = useUnistyles();
    const router = useRouter();
    const { register, loading, error } = useRegister(authService, storageService);

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('');

    const handleRegister = async () => {
        if (!username || !email || !password || !fullName) {
            Alert.alert('Error', 'Please fill in all required fields.');
            return;
        }

        const result = await register({
            username,
            email,
            password,
            fullName,
            bio,
        });

        if (result.success) {
            Alert.alert('Success', 'Account created successfully!', [
                { text: 'OK', onPress: () => router.replace('/(tabs)') }
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
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.contentContainer}>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>
                            Join us today!
                        </Text>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your full name"
                                placeholderTextColor={theme.colors.placeholder}
                                value={fullName}
                                onChangeText={setFullName}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Username</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Choose a username"
                                placeholderTextColor={theme.colors.placeholder}
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email"
                                placeholderTextColor={theme.colors.placeholder}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Create a password"
                                placeholderTextColor={theme.colors.placeholder}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Bio (Optional)</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Tell us about yourself"
                                placeholderTextColor={theme.colors.placeholder}
                                value={bio}
                                onChangeText={setBio}
                                multiline
                            />
                        </View>

                        {error && <Text style={styles.errorText}>{error}</Text>}

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleRegister}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color={theme.colors.activeTint} />
                            ) : (
                                <Text style={styles.buttonText}>Sign Up</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>
                                Already have an account?{' '}
                                <Text style={styles.link} onPress={() => router.replace('/login')}>Log In</Text>
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </>
    );
}

const styles = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    contentContainer: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
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
        marginBottom: theme.gap(4),
        textAlign: 'left',
        color: theme.colors.dimmed,
    },
    inputContainer: {
        marginBottom: theme.gap(2),
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
    textArea: {
        height: 100,
        paddingTop: 16,
        textAlignVertical: 'top',
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
        color: theme.colors.dimmed,
    },
    link: {
        fontWeight: '600',
        color: theme.colors.tint,
    }
}));
