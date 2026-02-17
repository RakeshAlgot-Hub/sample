import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { ChevronLeft } from 'lucide-react-native';

interface ManageHeaderProps {
  title?: string;
  onBack?: () => void;
}

export default function ManageHeader({ title = 'Buildings · Rooms · Properties', onBack }: ManageHeaderProps) {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderBottomColor: theme.border }]}> 
      {onBack ? (
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <ChevronLeft size={18} color={theme.text} strokeWidth={2} />
        </TouchableOpacity>
      ) : (
        <View style={styles.backButton} />
      )}
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      <View style={styles.backButton} />
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
