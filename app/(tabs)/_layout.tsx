import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';

export default function TabLayout() {
    const { theme } = useUnistyles();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.on_surface_variant,
                tabBarStyle: {
                    backgroundColor: theme.colors.surface_container_lowest,
                    borderTopWidth: 0, // No-Line rule
                    ...theme.elevation[3],
                    ...Platform.select({
                        ios: {
                            paddingBottom: 20,
                            height: 76,
                        },
                        android: {
                            height: 64,
                        },
                    }),
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: theme.typography.weights.semibold,
                    letterSpacing: 0.0,
                    marginTop: 2,
                },
            }}
        >
            {/* HOME */}
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarLabel: 'HOME',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" size={size} color={color} />
                    ),
                }}
            />

            {/* SEARCH */}
            <Tabs.Screen
                name="search"
                options={{
                    tabBarLabel: 'SEARCH',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="search-outline" size={size} color={color} />
                    ),
                }}
            />

            {/* REPORT — central megaphone action */}
            <Tabs.Screen
                name="messages"
                options={{
                    tabBarLabel: 'REPORT',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="megaphone-outline" size={size} color={color} />
                    ),
                }}
            />

            {/* LEADERS */}
            <Tabs.Screen
                name="leaders"
                options={{
                    tabBarLabel: 'LEADERS',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="people-outline" size={size} color={color} />
                    ),
                }}
            />

            {/* PROFILE */}
            <Tabs.Screen
                name="profile"
                options={{
                    tabBarLabel: 'PROFILE',
                
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
