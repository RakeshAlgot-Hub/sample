import { useCallback, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, BackHandler } from 'react-native';
import { useRouter, useFocusEffect, useNavigation } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import WizardTopHeader from '@/components/WizardTopHeader';
import { useWebBackHandler } from '@/hooks/useWebBackHandler';

export default function NotificationsScreen() {
    const theme = useTheme();
    const router = useRouter();
    const navigation = useNavigation();
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
            <WizardTopHeader title="Notifications" onBack={handleBack} showMenu={false} />
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
