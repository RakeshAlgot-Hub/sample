import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { Home, TrendingUp } from 'lucide-react-native';
import Animated, { FadeInDown, useAnimatedStyle, withTiming, useSharedValue, withDelay } from 'react-native-reanimated';
import { useEffect } from 'react';

interface OccupancyIndicatorProps {
  occupancyRate: number;
  occupiedBeds: number;
  totalBeds: number;
  delay?: number;
}

export default function OccupancyIndicator({
  occupancyRate,
  occupiedBeds,
  totalBeds,
  delay = 0,
}: OccupancyIndicatorProps) {
  const theme = useTheme();
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    progressWidth.value = withDelay(
      delay,
      withTiming(occupancyRate, { duration: 1000 })
    );
  }, [occupancyRate, delay]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const getOccupancyColor = () => {
    if (occupancyRate >= 80) return theme.success;
    if (occupancyRate >= 50) return theme.warning;
    return theme.error;
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify()}
      style={[
        styles.container,
        { backgroundColor: theme.card, borderColor: theme.cardBorder },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }]}>
          <TrendingUp size={24} color={theme.primary} strokeWidth={2} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: theme.text }]}>
            Occupancy Rate
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {occupiedBeds} of {totalBeds} beds occupied
          </Text>
        </View>
      </View>

      <View style={styles.rateContainer}>
        <Text style={[styles.rateValue, { color: getOccupancyColor() }]}>
          {occupancyRate.toFixed(1)}%
        </Text>
      </View>

      <View style={[styles.progressContainer, { backgroundColor: theme.border }]}>
        <Animated.View
          style={[
            styles.progressBar,
            { backgroundColor: getOccupancyColor() },
            progressStyle,
          ]}
        />
      </View>

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <View style={[styles.dot, { backgroundColor: theme.success }]} />
          <Text style={[styles.footerLabel, { color: theme.textSecondary }]}>
            Available: {totalBeds - occupiedBeds}
          </Text>
        </View>
        <View style={styles.footerItem}>
          <View style={[styles.dot, { backgroundColor: theme.accent }]} />
          <Text style={[styles.footerLabel, { color: theme.textSecondary }]}>
            Occupied: {occupiedBeds}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  rateContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  rateValue: {
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 56,
  },
  progressContainer: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  footerLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});
