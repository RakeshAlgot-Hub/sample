import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface OccupancyChartProps {
  occupied: number;
  available: number;
}

export function OccupancyChart({ occupied, available }: OccupancyChartProps) {
  const total = occupied + available;
  const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Occupancy Overview</Text>
        <View style={styles.rateContainer}>
          <Text style={styles.rateValue}>{occupancyRate}%</Text>
          <Text style={styles.rateLabel}>Occupied</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <View style={styles.barContainer}>
          {total > 0 ? (
            <>
              <View
                style={[
                  styles.occupiedBar,
                  { width: `${(occupied / total) * 100}%` },
                ]}
              />
              <View
                style={[
                  styles.availableBar,
                  { width: `${(available / total) * 100}%` },
                ]}
              />
            </>
          ) : (
            <View style={styles.emptyBar} />
          )}
        </View>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
          <Text style={styles.legendLabel}>Occupied</Text>
          <Text style={styles.legendValue}>{occupied}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.info }]} />
          <Text style={styles.legendLabel}>Available</Text>
          <Text style={styles.legendValue}>{available}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.paper,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border.light,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  rateContainer: {
    alignItems: 'flex-end',
  },
  rateValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  rateLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  chartContainer: {
    marginBottom: 16,
  },
  barContainer: {
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.background.elevated,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  occupiedBar: {
    height: '100%',
    backgroundColor: Colors.success,
  },
  availableBar: {
    height: '100%',
    backgroundColor: Colors.info,
  },
  emptyBar: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.neutral[200],
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 13,
    color: Colors.text.secondary,
    flex: 1,
  },
  legendValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
});
