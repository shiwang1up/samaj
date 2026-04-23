import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Config } from '../../constants/Config';
import { useSearchUsers } from '../../hooks/useSearchUsers';
import { User } from '../../services/user/IUserService';

export default function SearchScreen() {
    const { theme } = useUnistyles();
    const { searchUsers, users, loading, error } = useSearchUsers();
    const [query, setQuery] = useState('');

    // Simple debounce implementation
    const handleSearch = useCallback((text: string) => {
        setQuery(text);

        // Clear previous timeout if it exists
        if ((handleSearch as any).timeout) {
            clearTimeout((handleSearch as any).timeout);
        }

        // Set new timeout
        (handleSearch as any).timeout = setTimeout(() => {
            searchUsers(text);
        }, 500);
    }, [searchUsers]);

    const getProfileImage = (url: string) => {
        if (!url) return 'http://via.placeholder.com/50';
        if (url.includes('localhost')) {
            return url.replace('localhost', `${Config.HOST}`);
        }
        return url;
    };

    const renderItem = ({ item }: { item: User }) => (
        <TouchableOpacity style={styles.userCard}>
            <Image
                source={{ uri: getProfileImage(item.profilePicture) }}
                style={styles.avatar}
            />
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.fullName}</Text>
                <Text style={styles.userHandle}>@{item.username}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Search</Text>
            </View>
            <View style={styles.content}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search..."
                    placeholderTextColor={theme.colors.placeholder}
                    value={query}
                    onChangeText={handleSearch}
                    autoCapitalize="none"
                />

                {loading && (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color={theme.colors.typography} />
                    </View>
                )}

                {error && (
                    <Text style={styles.errorText}>{error}</Text>
                )}

                {!loading && !error && users.length === 0 && query.trim().length > 0 && (
                    <Text style={styles.subtitle}>No users found.</Text>
                )}

                {!loading && !error && users.length === 0 && query.trim().length === 0 && (
                    <Text style={styles.subtitle}>Find what you&apos;re looking for.</Text>
                )}

                <FlatList
                    data={users}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    keyboardShouldPersistTaps="handled"
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: 60,
    },
    header: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: theme.colors.typography,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        gap: theme.gap(2),
    },
    searchInput: {
        height: 50,
        backgroundColor: theme.colors.dimmed,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: theme.colors.typography,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.dimmed,
        textAlign: 'center',
        marginTop: 20,
    },
    listContent: {
        paddingBottom: 20,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.dimmed,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: theme.colors.dimmed,
    },
    userInfo: {
        marginLeft: 12,
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.typography,
    },
    userHandle: {
        fontSize: 14,
        color: theme.colors.placeholder,
    },
    centerContainer: {
        padding: 20,
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 10,
    },
}));
