import { useCallback, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Switch, BackHandler } from 'react-native';
import { useRouter, useFocusEffect, useNavigation } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import WizardTopHeader from '@/components/WizardTopHeader';
import { useStore } from '@/store/useStore';
import { Moon, Sun } from 'lucide-react-native';
import { useWebBackHandler } from '@/hooks/useWebBackHandler';

export default function PreferencesScreen() {
    const theme = useTheme();
    const router = useRouter();
    const navigation = useNavigation();
    const { themeMode, toggleTheme } = useStore();
    const isHandlingBack = useRef(false);

    const handleBack = useCallback(() => {
        isHandlingBack.current = true;
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

            const beforeRemove = navigation.addListener('beforeRemove', (event) => {
                if (isHandlingBack.current) {
                    return;
                }
                event.preventDefault();
                handleBack();
            });

            return () => {
                subscription.remove();
                beforeRemove();
            };
        }, [handleBack, navigation]),
    );

    useWebBackHandler(handleBack);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <WizardTopHeader title="App Preferences" onBack={handleBack} showMenu={false} />
            <View style={styles.content}>
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <View style={styles.settingRow}>
                        <View style={styles.settingLeft}>
                            {themeMode === 'light' ? (
                                <Sun size={20} color={theme.textSecondary} strokeWidth={2} />
                            ) : (
                                <Moon size={20} color={theme.textSecondary} strokeWidth={2} />
                            )}
                            <Text style={[styles.settingLabel, { color: theme.text }]}>
                                {themeMode === 'light' ? 'Light Mode' : 'Dark Mode'}
                            </Text>
                        </View>
                        <Switch
                            value={themeMode === 'dark'}
                            onValueChange={toggleTheme}
                            trackColor={{ false: theme.inputBorder, true: theme.primary }}
                            thumbColor={theme.background}
                        />
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
        gap: 16,
    },
    card: {
        padding: 18,
        borderRadius: 14,
        borderWidth: 1,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    settingLabel: {
        fontSize: 15,
        fontWeight: '600',
    },
});
