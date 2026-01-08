import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export default function ProfileScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Profile</Text>
            </View>
            <View style={styles.content}>
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>JD</Text>
                </View>
                <Text style={styles.name}>John Doe</Text>
                <Text style={styles.bio}>Software Developer | React Native Enthusiast</Text>
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
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 40,
        gap: theme.gap(2),
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.colors.tint,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    avatarText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: theme.colors.activeTint,
    },
    name: {
        fontSize: 24,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    bio: {
        fontSize: 16,
        color: theme.colors.dimmed,
        textAlign: 'center',
        paddingHorizontal: 30,
    },
}));
