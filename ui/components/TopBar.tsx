import { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { Search, MoreVertical, Settings } from 'lucide-react-native';

interface TopBarProps {
    onSearchPress?: () => void;
}

export default function TopBar({ onSearchPress }: TopBarProps) {
    const theme = useTheme();
    const router = useRouter();
    const [menuVisible, setMenuVisible] = useState(false);

    const handleSettingsPress = () => {
        setMenuVisible(false);
        router.push('/(tabs)/settings');
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
            <Text style={[styles.logo, { color: theme.primary }]}>PropertyPal</Text>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={onSearchPress}
                    activeOpacity={0.7}
                >
                    <Search size={22} color={theme.text} strokeWidth={2} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => setMenuVisible(true)}
                    activeOpacity={0.7}
                >
                    <MoreVertical size={22} color={theme.text} strokeWidth={2} />
                </TouchableOpacity>
            </View>

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
    logo: {
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
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
