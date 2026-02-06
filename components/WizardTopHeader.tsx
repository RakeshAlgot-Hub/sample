import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '@/theme/useTheme';

interface WizardTopHeaderProps {
    title?: string;
    onBack: () => void;
}

export default function WizardTopHeader({ title = 'Settings', onBack }: WizardTopHeaderProps) {
    const theme = useTheme();

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
            <View style={styles.rightSpacer} />
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
    rightSpacer: {
        width: 40,
        height: 40,
    },
});
