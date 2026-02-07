import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useTheme } from '@/theme/useTheme';

export default function PaymentsScreen() {
    const theme = useTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.text }]}>Payments</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Coming soon</Text>
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
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        gap: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '600',
    },
});
