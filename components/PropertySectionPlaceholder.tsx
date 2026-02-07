import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import WizardTopHeader from '@/components/WizardTopHeader';

interface PropertySectionPlaceholderProps {
    title: string;
}

export default function PropertySectionPlaceholder({ title }: PropertySectionPlaceholderProps) {
    const theme = useTheme();
    const router = useRouter();
    const pathname = usePathname();
    const { id, source } = useLocalSearchParams<{ id?: string; source?: string }>();

    const isSettingsFlow = pathname.includes('/settings/');
    const isDashboardFlow = source === 'dashboard' || !isSettingsFlow;

    const handleBack = () => {
        if (isDashboardFlow) {
            router.back();
            return;
        }

        if (id) {
            router.push({ pathname: '/settings/property-details/[id]', params: { id } });
        } else {
            router.push('/settings/property-details' as '/settings/property-details/index');
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <WizardTopHeader title={title} onBack={handleBack} showMenu={false} />
            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
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
