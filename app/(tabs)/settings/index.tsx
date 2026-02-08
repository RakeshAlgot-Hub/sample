import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    BackHandler,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { useTheme } from '@/theme/useTheme';
import WizardTopHeader from '@/components/WizardTopHeader';
import {
    User,
    Home,
    Bell,
    SlidersHorizontal,
    Download,
    Shield,
    HelpCircle,
    ChevronRight,
} from 'lucide-react-native';

type SettingsItem = {
    key: string;
    label: string;
    icon: typeof User;
    hint?: string;
    tone?: 'danger';
    onPress?: () => void;
};

type SettingsSection = {
    title: string;
    items: SettingsItem[];
};

export default function SettingsScreen() {
    const theme = useTheme();
    const router = useRouter();

    const handleBack = useCallback(() => {
        router.back();
    }, [router]);

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                handleBack();
                return true;
            };

            const subscription = BackHandler.addEventListener(
                'hardwareBackPress',
                onBackPress,
            );

            return () => subscription.remove();
        }, [handleBack]),
    );
    const sections: SettingsSection[] = [
        {
            title: 'Settings',
            items: [
                {
                    key: 'profile',
                    label: 'Account',
                    icon: User,
                    onPress: () => router.push('/(tabs)/settings/account'),
                },
                {
                    key: 'hostel',
                    label: 'Property Details',
                    icon: Home,
                    onPress: () =>
                        router.push('/settings/property-details' as '/settings/property-details/index'),
                },
                {
                    key: 'notifications',
                    label: 'Notifications',
                    icon: Bell,
                    onPress: () => router.push('/(tabs)/settings/notifications'),
                },
                {
                    key: 'preferences',
                    label: 'App Preferences',
                    icon: SlidersHorizontal,
                    onPress: () => router.push('/(tabs)/settings/preferences'),
                },
                {
                    key: 'import',
                    label: 'Import & Export',
                    icon: Download,
                    onPress: () => router.push('/(tabs)/settings/import-export'),
                },
                {
                    key: 'privacy',
                    label: 'Privacy & Security',
                    icon: Shield,
                    onPress: () => router.push('/(tabs)/settings/privacy-security'),
                },
                {
                    key: 'help',
                    label: 'Help & Support',
                    icon: HelpCircle,
                    onPress: () => router.push('/(tabs)/settings/help-support'),
                },
            ],
        },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <WizardTopHeader title="Settings" onBack={handleBack} showMenu={false} />
            <ScrollView contentContainerStyle={styles.content}>
                {sections.map((section) => (
                    <View key={section.title} style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                            {section.title}
                        </Text>
                        <View style={styles.list}>
                            {section.items.map((item, index) => {
                                const Icon = item.icon;
                                const isDanger = item.tone === 'danger';
                                const iconColor = isDanger ? theme.error : theme.primary;
                                const labelColor = isDanger ? theme.error : theme.text;
                                const hintColor = isDanger ? theme.error : theme.textSecondary;

                                return (
                                    <View key={item.key}>
                                        <TouchableOpacity
                                            style={[
                                                styles.row,
                                                {
                                                    backgroundColor: theme.card,
                                                    borderColor: theme.cardBorder,
                                                },
                                            ]}
                                            activeOpacity={0.7}
                                            onPress={item.onPress}
                                        >
                                            <View style={styles.rowLeft}>
                                                <View style={[styles.iconWrap, { backgroundColor: iconColor + '15' }]}>
                                                    <Icon size={18} color={iconColor} strokeWidth={2} />
                                                </View>
                                                <View style={styles.textWrap}>
                                                    <Text style={[styles.rowLabel, { color: labelColor }]}>{item.label}</Text>
                                                    {item.hint && (
                                                        <Text style={[styles.rowHint, { color: hintColor }]}>
                                                            {item.hint}
                                                        </Text>
                                                    )}
                                                </View>
                                            </View>
                                            <ChevronRight size={18} color={theme.textSecondary} strokeWidth={2} />
                                        </TouchableOpacity>
                                        {index < section.items.length - 1 && <View style={styles.rowGap} />}
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
        gap: 20,
    },
    section: {
        gap: 10,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.6,
        textTransform: 'uppercase',
    },
    list: {
        gap: 10,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textWrap: {
        gap: 2,
    },
    rowLabel: {
        fontSize: 15,
        fontWeight: '600',
    },
    rowHint: {
        fontSize: 12,
        fontWeight: '500',
    },
    rowGap: {
        height: 6,
    },
});
