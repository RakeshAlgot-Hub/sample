import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useTheme } from '@/theme/useTheme';
import { useStore } from '@/store/useStore';
import WizardTopHeader from '@/components/WizardTopHeader';
import { User, Mail, LogOut } from 'lucide-react-native';

export default function AccountScreen() {
    const router = useRouter();
    const theme = useTheme();
    const { user, logout } = useStore();

    const handleBack = useCallback(() => {
        router.back();
    }, [router]);

    const handleLogout = async () => {
        await logout();
        router.replace('/(auth)/login');
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <WizardTopHeader title="Account" onBack={handleBack} showMenu={false} />
            <ScrollView contentContainerStyle={styles.content}>
                <View
                    style={[
                        styles.card,
                        { backgroundColor: theme.card, borderColor: theme.cardBorder },
                    ]}
                >
                    <View
                        style={[
                            styles.avatarContainer,
                            { backgroundColor: theme.primary + '15' },
                        ]}
                    >
                        <User size={48} color={theme.primary} strokeWidth={2} />
                    </View>

                    <View style={styles.userInfo}>
                        <View style={styles.infoRow}>
                            <User size={18} color={theme.textSecondary} strokeWidth={2} />
                            <View style={styles.infoTextContainer}>
                                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Name</Text>
                                <Text style={[styles.infoValue, { color: theme.text }]}>
                                    {user?.name}
                                </Text>
                            </View>
                        </View>

                        <View style={[styles.divider, { backgroundColor: theme.border }]} />

                        <View style={styles.infoRow}>
                            <Mail size={18} color={theme.textSecondary} strokeWidth={2} />
                            <View style={styles.infoTextContainer}>
                                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Email</Text>
                                <Text style={[styles.infoValue, { color: theme.text }]}>
                                    {user?.email}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.logoutButton, { backgroundColor: theme.accent }]}
                    onPress={handleLogout}
                    activeOpacity={0.8}
                >
                    <LogOut size={20} color="#ffffff" strokeWidth={2} />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: theme.textSecondary }]}>PropertyPal v1.0.0</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
        paddingBottom: 100,
        gap: 18,
    },
    card: {
        padding: 18,
        borderRadius: 14,
        borderWidth: 1,
        gap: 18,
    },
    avatarContainer: {
        width: 88,
        height: 88,
        borderRadius: 44,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    userInfo: {
        gap: 14,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    infoTextContainer: {
        flex: 1,
        gap: 3,
    },
    infoLabel: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '600',
    },
    divider: {
        height: 1,
    },
    logoutButton: {
        flexDirection: 'row',
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginTop: 10,
    },
    logoutText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '600',
    },
    footer: {
        alignItems: 'center',
        marginTop: 20,
    },
    footerText: {
        fontSize: 12,
    },
});
