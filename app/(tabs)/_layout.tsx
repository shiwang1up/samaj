import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';

export default function TabLayout() {
    const { theme } = useUnistyles();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: theme.colors.tint,
                tabBarInactiveTintColor: theme.colors.dimmed,
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: theme.colors.background,
                    borderTopColor: theme.colors.dimmed,
                    ...Platform.select({
                        android: {
                            elevation: 4,
                        },
                        ios: {
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: -2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                        }
                    })
                }
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarLabel: 'Home',
                }}
            />
        </Tabs>
    );
}
