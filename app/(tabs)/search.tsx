import { Text, TextInput, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export default function SearchScreen() {
    const { theme } = useUnistyles();

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
                />
                <Text style={styles.subtitle}>Find what you&apos;re looking for.</Text>
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
}));
