// Leaders tab — placeholder screen
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export default function LeadersScreen() {
    return (
        <View style={styles.root}>
            <Text style={styles.emoji}>🏆</Text>
            <Text style={styles.title}>Map</Text>
            <Text style={styles.sub}>Top civic advocates in your colony.</Text>
        </View>
    );
}

const styles = StyleSheet.create((theme) => ({
    root: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.sm,
    },
    emoji: { fontSize: 40 },
    title: {
        fontSize: theme.typography.sizes.headline_sm,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.on_surface,
    },
    sub: {
        fontSize: theme.typography.sizes.body_sm,
        color: theme.colors.on_surface_variant,
    },
}));
