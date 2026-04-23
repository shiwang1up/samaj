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

    const [focusedField, setFocusedField] = useState<string | null>(null);

    const handleRegister = async () => {
        if (!username || !email || !password || !fullName) {
            Alert.alert('Validation', 'Please fill in all required fields.');
            return;
        }
        const result = await register({ username, email, password, fullName, bio });
        if (result.success) {
            router.replace(result.token ? '/(tabs)' : '/login');
        }
    };

    const fieldProps = (name: string) => ({
        onFocus: () => setFocusedField(name),
        onBlur:  () => setFocusedField(null),
    });

    const isFocused = (name: string) => focusedField === name;

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.root}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* ── Logo / Brand ── */}
                    <View style={styles.brandRow}>
                        <Text style={styles.brandIcon}>🏛</Text>
                        <Text style={styles.brandName}>Samaj</Text>
                    </View>

                    {/* ── Tab Switcher ── */}
                    <View style={styles.tabBar}>
                        <TouchableOpacity
                            style={styles.tabInactive}
                            onPress={() => router.replace('/login')}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.tabTextInactive}>Sign In</Text>
                        </TouchableOpacity>
                        <View style={styles.tabActive}>
                            <Text style={styles.tabTextActive}>Join Samaj</Text>
                        </View>
                    </View>

                    {/* ── Hero Copy ── */}
                    <Text style={styles.headline}>Create your account</Text>
                    <Text style={styles.subheadline}>
                        Join a verified civic community today.
                    </Text>

                    {/* ── Full Name ── */}
                    <Text style={styles.label}>Full Name</Text>
                    <View style={[styles.inputWrapper, isFocused('fullName') && styles.inputWrapperFocused]}>
                        <Text style={styles.inputIcon}>👤</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Your full name"
                            placeholderTextColor={theme.colors.placeholder}
                            value={fullName}
                            onChangeText={setFullName}
                            {...fieldProps('fullName')}
                        />
                    </View>

                    {/* ── Username ── */}
                    <Text style={styles.label}>Username</Text>
                    <View style={[styles.inputWrapper, isFocused('username') && styles.inputWrapperFocused]}>
                        <Text style={styles.inputIcon}>@</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="choose_a_handle"
                            placeholderTextColor={theme.colors.placeholder}
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                            autoCorrect={false}
                            {...fieldProps('username')}
                        />
                    </View>

                    {/* ── Email ── */}
                    <Text style={styles.label}>Email Address</Text>
                    <View style={[styles.inputWrapper, isFocused('email') && styles.inputWrapperFocused]}>
                        <Text style={styles.inputIcon}>✉</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="name@example.com"
                            placeholderTextColor={theme.colors.placeholder}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            {...fieldProps('email')}
                        />
                    </View>

                    {/* ── Password ── */}
                    <Text style={styles.label}>Password</Text>
                    <View style={[styles.inputWrapper, isFocused('password') && styles.inputWrapperFocused]}>
                        <Text style={styles.inputIcon}>🔒</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Create a strong password"
                            placeholderTextColor={theme.colors.placeholder}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            {...fieldProps('password')}
                        />
                    </View>

                    {/* ── Bio (Optional) ── */}
                    <Text style={styles.label}>Bio <Text style={styles.optionalTag}>(Optional)</Text></Text>
                    <View style={[styles.inputWrapper, styles.textAreaWrapper, isFocused('bio') && styles.inputWrapperFocused]}>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Tell your community about yourself…"
                            placeholderTextColor={theme.colors.placeholder}
                            value={bio}
                            onChangeText={setBio}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                            {...fieldProps('bio')}
                        />
                    </View>

                    {/* ── Error ── */}
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    {/* ── Primary CTA ── */}
                    <TouchableOpacity
                        style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
                        onPress={handleRegister}
                        disabled={loading}
                        activeOpacity={0.85}
                    >
                        {loading ? (
                            <ActivityIndicator color={theme.colors.on_primary} />
                        ) : (
                            <Text style={styles.primaryBtnText}>Create Account  →</Text>
                        )}
                    </TouchableOpacity>

                    {/* ── Divider ── */}
                    <View style={styles.dividerRow}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerLabel}>OR VERIFY WITH</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* ── Local Civic ID (Trust Badge button) ── */}
                    <TouchableOpacity style={styles.civicBtn} activeOpacity={0.85}>
                        <Text style={styles.civicIcon}>🪪</Text>
                        <Text style={styles.civicBtnText}>Local Civic ID</Text>
                    </TouchableOpacity>

                    {/* ── Social Row ── */}
                    <View style={styles.socialRow}>
                        <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
                            <Text style={styles.socialIcon}>G</Text>
                            <Text style={styles.socialText}>Google</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
                            <Text style={styles.socialIcon}></Text>
                            <Text style={styles.socialText}>Apple</Text>
                        </TouchableOpacity>
                    </View>

                    {/* ── Footer ── */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            {'Already have an account? '}
                            <Text style={styles.footerLink} onPress={() => router.replace('/login')}>
                                Sign In
                            </Text>
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </>
    );
}

const styles = StyleSheet.create((theme) => ({
    root: {
        flex: 1,
        backgroundColor: theme.colors.surface,
    },
    scroll: {
        flexGrow: 1,
        paddingHorizontal: theme.spacing.xl,
        paddingTop: 64,
        paddingBottom: theme.spacing['3xl'],
    },

    // ── Brand ──────────────────────────────────────────────────
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing['2xl'],
    },
    brandIcon: {
        fontSize: 24,
        marginRight: 8,
    },
    brandName: {
        fontSize: theme.typography.sizes.title_lg,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.primary,
        letterSpacing: theme.typography.tracking.title,
    },

    // ── Tab Switcher ───────────────────────────────────────────
    tabBar: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface_container_low,
        borderRadius: theme.radius.lg,
        padding: 4,
        marginBottom: theme.spacing['2xl'],
    },
    tabActive: {
        flex: 1,
        paddingVertical: theme.spacing.sm,
        alignItems: 'center',
        backgroundColor: theme.colors.surface_container_lowest,
        borderRadius: theme.radius.md,
        ...theme.elevation[1],
    },
    tabInactive: {
        flex: 1,
        paddingVertical: theme.spacing.sm,
        alignItems: 'center',
    },
    tabTextActive: {
        fontSize: theme.typography.sizes.label_lg,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.primary,
    },
    tabTextInactive: {
        fontSize: theme.typography.sizes.label_lg,
        fontWeight: theme.typography.weights.medium,
        color: theme.colors.on_surface_variant,
    },

    // ── Hero Copy ──────────────────────────────────────────────
    headline: {
        fontSize: theme.typography.sizes.headline_lg,
        fontWeight: theme.typography.weights.extrabold,
        color: theme.colors.primary,
        letterSpacing: theme.typography.tracking.headline,
        marginBottom: theme.spacing.xs,
    },
    subheadline: {
        fontSize: theme.typography.sizes.body_md,
        color: theme.colors.on_surface_variant,
        marginBottom: theme.spacing['2xl'],
    },

    // ── Inputs ────────────────────────────────────────────────
    label: {
        fontSize: theme.typography.sizes.label_md,
        fontWeight: theme.typography.weights.semibold,
        color: theme.colors.on_surface,
        marginBottom: theme.spacing.xs,
    },
    optionalTag: {
        fontWeight: theme.typography.weights.regular,
        color: theme.colors.on_surface_variant,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface_container,
        borderRadius: theme.radius.lg,
        paddingHorizontal: theme.spacing.base,
        height: 52,
        marginBottom: theme.spacing.base,
        borderWidth: 1,
        borderColor: 'rgba(192, 201, 193, 0.15)',
    },
    inputWrapperFocused: {
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.primary,
        borderColor: 'rgba(192, 201, 193, 0.15)',
    },
    textAreaWrapper: {
        height: 'auto' as any,
        minHeight: 80,
        alignItems: 'flex-start',
        paddingVertical: theme.spacing.md,
    },
    inputIcon: {
        fontSize: 16,
        marginRight: 10,
        color: theme.colors.on_surface_variant,
    },
    input: {
        flex: 1,
        fontSize: theme.typography.sizes.body_md,
        color: theme.colors.on_surface,
    },
    textArea: {
        minHeight: 60,
        textAlignVertical: 'top',
        paddingTop: 2,
    },

    // ── Error ─────────────────────────────────────────────────
    errorText: {
        color: theme.colors.error,
        fontSize: theme.typography.sizes.body_sm,
        marginBottom: theme.spacing.base,
        textAlign: 'center',
    },

    // ── Primary Button ────────────────────────────────────────
    primaryBtn: {
        height: 52,
        borderRadius: theme.radius.xl,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
        ...theme.elevation[2],
    },
    primaryBtnDisabled: {
        opacity: 0.6,
    },
    primaryBtnText: {
        fontSize: theme.typography.sizes.title_sm,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.on_primary,
        letterSpacing: 0.3,
    },

    // ── Divider ───────────────────────────────────────────────
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
        gap: theme.spacing.sm,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: theme.colors.surface_container_highest,
    },
    dividerLabel: {
        fontSize: theme.typography.sizes.label_sm,
        fontWeight: theme.typography.weights.semibold,
        color: theme.colors.on_surface_variant,
        letterSpacing: 1.2,
    },

    // ── Civic ID (Trust Badge CTA) ────────────────────────────
    civicBtn: {
        height: 52,
        borderRadius: theme.radius.lg,
        backgroundColor: theme.colors.tertiary_container,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginBottom: theme.spacing.base,
        ...theme.elevation[1],
    },
    civicIcon: {
        fontSize: 18,
    },
    civicBtnText: {
        fontSize: theme.typography.sizes.label_lg,
        fontWeight: theme.typography.weights.semibold,
        color: theme.colors.tertiary_fixed,
    },

    // ── Social Row ────────────────────────────────────────────
    socialRow: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing['2xl'],
    },
    socialBtn: {
        flex: 1,
        height: 48,
        borderRadius: theme.radius.lg,
        backgroundColor: theme.colors.surface_container_lowest,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: theme.colors.surface_container_highest,
    },
    socialIcon: {
        fontSize: 16,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.on_surface,
    },
    socialText: {
        fontSize: theme.typography.sizes.label_md,
        fontWeight: theme.typography.weights.medium,
        color: theme.colors.on_surface,
    },

    // ── Footer ────────────────────────────────────────────────
    footer: {
        alignItems: 'center',
    },
    footerText: {
        fontSize: theme.typography.sizes.body_sm,
        color: theme.colors.on_surface_variant,
    },
    footerLink: {
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.primary,
    },
}));
