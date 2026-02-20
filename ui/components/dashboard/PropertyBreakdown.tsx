import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Building } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

interface PropertyData {
  id: string;
  name: string;
  type: string;
  totalUnits: number;
  occupiedUnits: number;
  occupancyRate: number;
}

interface PropertyBreakdownProps {
  properties: PropertyData[];
}

export function PropertyBreakdown({ properties }: PropertyBreakdownProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Property Breakdown</Text>
        <Text style={styles.subtitle}>{properties.length} Properties</Text>
      </View>

      {properties.length === 0 ? (
        <View style={styles.emptyState}>
          <Building size={32} color={Colors.neutral[400]} strokeWidth={1.5} />
          <Text style={styles.emptyText}>No properties</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {properties.map((property) => (
            <View key={property.id} style={styles.propertyCard}>
              <View style={styles.propertyHeader}>
                <View style={styles.propertyIconContainer}>
                  <Building size={16} color={Colors.primary} />
                </View>
                <View style={styles.propertyBadge}>
                  <Text style={styles.propertyBadgeText}>{property.type}</Text>
                </View>
              </View>

              <Text style={styles.propertyName} numberOfLines={1}>
                {property.name}
              </Text>

              <View style={styles.statsContainer}>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Total Units</Text>
                  <Text style={styles.statValue}>{property.totalUnits}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Occupied</Text>
                  <Text style={styles.statValue}>{property.occupiedUnits}</Text>
                </View>
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${property.occupancyRate}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>{property.occupancyRate}%</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
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
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 8,
  },
  scrollContent: {
    gap: 12,
    paddingRight: 16,
  },
  propertyCard: {
    width: 200,
    backgroundColor: Colors.background.elevated,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  propertyIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.background.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  propertyBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  propertyBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  propertyName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  statsContainer: {
    gap: 8,
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.neutral[200],
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.success,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.primary,
    minWidth: 36,
    textAlign: 'right',
  },
});
