import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { LucideIcon } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 380;

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  delay?: number;
}

export default function StatCard({ icon: Icon, label, value, delay = 0 }: StatCardProps) {
  const theme = useTheme();

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify()}
      style={[
        styles.container,
        { backgroundColor: theme.card, borderColor: theme.cardBorder },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }]}>
        <Icon size={isSmallScreen ? 20 : 24} color={theme.primary} strokeWidth={2} />
      </View>
      <Text style={[styles.value, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: isSmallScreen ? 140 : 155,
    padding: isSmallScreen ? 14 : 18,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    gap: 10,
  },
  iconContainer: {
    width: isSmallScreen ? 48 : 54,
    height: isSmallScreen ? 48 : 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    fontSize: isSmallScreen ? 26 : 30,
    fontWeight: '700',
    lineHeight: isSmallScreen ? 30 : 34,
  },
  label: {
    fontSize: isSmallScreen ? 13 : 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
