import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import WizardTopHeader from '@/components/WizardTopHeader';

export default function NotificationsScreen() {
    const theme = useTheme();
    const router = useRouter();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <WizardTopHeader title="Notifications" onBack={() => router.push('/(tabs)/settings')} showMenu={false} />
            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.text }]}>Notifications</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Upcoming</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '600',
    },
});
