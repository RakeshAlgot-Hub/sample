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
        { 
          backgroundColor: theme.card, 
          borderColor: theme.cardBorder,
          shadowColor: theme.primary,
        },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: theme.primary }]}>
        <Icon size={isSmallScreen ? 22 : 26} color="#ffffff" strokeWidth={2.5} />
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
    padding: isSmallScreen ? 16 : 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: isSmallScreen ? 52 : 58,
    height: isSmallScreen ? 52 : 58,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  value: {
    fontSize: isSmallScreen ? 28 : 32,
    fontWeight: '800',
    lineHeight: isSmallScreen ? 32 : 36,
  },
  label: {
    fontSize: isSmallScreen ? 13 : 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
