import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, MoreVertical, Settings, X } from 'lucide-react-native';
import { useTheme } from '@/theme/useTheme';

interface WizardTopHeaderProps {
    title?: string;
    onBack: () => void;
    showMenu?: boolean;
    rightAction?: 'menu' | 'close' | 'none';
    onClose?: () => void;
}

export default function WizardTopHeader({
    title = 'Settings',
    onBack,
    showMenu = true,
    rightAction,
    onClose,
}: WizardTopHeaderProps) {
    const theme = useTheme();
    const router = useRouter();
    const [menuVisible, setMenuVisible] = useState(false);

    const resolvedAction = rightAction ?? (showMenu ? 'menu' : 'none');

    const handleSettingsPress = () => {
        setMenuVisible(false);
        router.push('/(tabs)/settings');
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
            <TouchableOpacity
                onPress={onBack}
                style={[styles.backButton, { borderColor: theme.border }]}
                activeOpacity={0.7}
            >
                <ChevronLeft size={18} color={theme.text} strokeWidth={2} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
            {resolvedAction === 'menu' ? (
                <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => setMenuVisible(true)}
                    activeOpacity={0.7}
                >
                    <MoreVertical size={20} color={theme.text} strokeWidth={2} />
                </TouchableOpacity>
            ) : resolvedAction === 'close' ? (
                <TouchableOpacity
                    style={[styles.menuButton, { backgroundColor: theme.inputBackground }]}
                    onPress={onClose}
                    activeOpacity={0.7}
                >
                    <X size={18} color={theme.text} strokeWidth={2} />
                </TouchableOpacity>
            ) : (
                <View style={styles.menuButton} />
            )}

            {resolvedAction === 'menu' && (
                <Modal
                    visible={menuVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setMenuVisible(false)}
                >
                    <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
                        <View style={[styles.menu, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={handleSettingsPress}
                                activeOpacity={0.7}
                            >
                                <Settings size={20} color={theme.text} strokeWidth={2} />
                                <Text style={[styles.menuText, { color: theme.text }]}>Settings</Text>
                            </TouchableOpacity>

                        </View>
                    </Pressable>
                </Modal>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    menuButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
    },
    menu: {
        marginTop: 60,
        marginRight: 16,
        borderRadius: 12,
        borderWidth: 1,
        minWidth: 180,
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.25)',
        elevation: 5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    menuText: {
        fontSize: 15,
        fontWeight: '600',
    },
    menuDivider: {
        height: 1,
        marginHorizontal: 12,
    },
});
