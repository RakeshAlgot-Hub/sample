import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Check, Bed } from 'lucide-react-native';
import { UnitResponse } from '@/services/unitService';
import { Colors } from '@/constants/Colors';
import { Fonts, Spacing, BorderRadius } from '@/constants/Theme';

interface Step1Props {
  availableUnits: UnitResponse[];
  selectedUnitId: string | null;
  onSelect: (unitId: string) => void;
  onNext: () => void;
  loading: boolean;
}

export function Step1SelectBed({
  availableUnits,
  selectedUnitId,
  onSelect,
  onNext,
  loading,
}: Step1Props) {
  const safeAvailableUnits = availableUnits || [];

  const getBedInfo = (unit: UnitResponse) => {
    const building =
      ('buildingName' in unit ? (unit as any).buildingName : undefined) ||
      unit.buildingId;
    const floor =
      ('floorName' in unit ? (unit as any).floorName : undefined) || unit.floorId;
    const room =
      ('roomNumber' in unit ? (unit as any).roomNumber : undefined) || unit.roomId;
    return { building, floor, room };
  };

  const groupedBeds = safeAvailableUnits.reduce((acc, unit) => {
    const { building, floor, room } = getBedInfo(unit);
    const key = `${building}-${floor}-${room}`;
    if (!acc[key]) {
      acc[key] = { building, floor, room, beds: [] };
    }
    acc[key].beds.push(unit);
    return acc;
  }, {} as Record<string, { building: string; floor: string; room: string; beds: UnitResponse[] }>);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Bed</Text>
        <Text style={styles.subtitle}>
          {safeAvailableUnits.length} available beds
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading beds...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {safeAvailableUnits.length === 0 ? (
            <View style={styles.emptyState}>
              <Bed size={48} color={Colors.neutral[400]} strokeWidth={1.5} />
              <Text style={styles.emptyText}>No available beds</Text>
              <Text style={styles.emptySubtext}>
                All beds are currently occupied
              </Text>
            </View>
          ) : (
            Object.entries(groupedBeds).map(([key, group]) => (
              <View key={key} style={styles.roomGroup}>
                <View style={styles.roomHeader}>
                  <Text style={styles.roomTitle}>
                    Room {group.room}
                  </Text>
                  <Text style={styles.roomLocation}>
                    Building {group.building} • Floor {group.floor}
                  </Text>
                </View>
                <View style={styles.bedsGrid}>
                  {group.beds.map((unit) => {
                    const isSelected = selectedUnitId === unit.id;
                    const isDisabled = unit.status === 'occupied';

                    return (
                      <TouchableOpacity
                        key={unit.id}
                        style={[
                          styles.bedCard,
                          isSelected && styles.bedCardSelected,
                          isDisabled && styles.bedCardDisabled,
                        ]}
                        disabled={isDisabled}
                        onPress={() => onSelect(unit.id)}>
                        <Bed
                          size={20}
                          color={
                            isSelected
                              ? Colors.background.paper
                              : isDisabled
                              ? Colors.neutral[400]
                              : Colors.primary
                          }
                          strokeWidth={2}
                        />
                        <Text
                          style={[
                            styles.bedNumber,
                            isSelected && styles.bedNumberSelected,
                            isDisabled && styles.bedNumberDisabled,
                          ]}>
                          {unit.bedNumber}
                        </Text>
                        {isSelected && (
                          <View style={styles.checkBadge}>
                            <Check size={12} color={Colors.background.paper} strokeWidth={3} />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, !selectedUnitId && styles.disabledButton]}
          onPress={onNext}
          disabled={!selectedUnitId}>
          <Text style={styles.nextButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.paper,
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: Fonts.size.xl,
    fontWeight: Fonts.weight.bold,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: Fonts.size.sm,
    color: Colors.text.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: Fonts.size.base,
    color: Colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.base,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: Fonts.size.md,
    fontWeight: Fonts.weight.semiBold,
    color: Colors.text.primary,
  },
  emptySubtext: {
    fontSize: Fonts.size.base,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  roomGroup: {
    marginBottom: Spacing.lg,
  },
  roomHeader: {
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  roomTitle: {
    fontSize: Fonts.size.md,
    fontWeight: Fonts.weight.semiBold,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  roomLocation: {
    fontSize: Fonts.size.xs,
    color: Colors.text.secondary,
  },
  bedsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  bedCard: {
    width: 72,
    height: 72,
    backgroundColor: Colors.background.elevated,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    position: 'relative',
  },
  bedCardSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  bedCardDisabled: {
    opacity: 0.4,
  },
  bedNumber: {
    fontSize: Fonts.size.sm,
    fontWeight: Fonts.weight.semiBold,
    color: Colors.text.primary,
  },
  bedNumberSelected: {
    color: Colors.background.paper,
  },
  bedNumberDisabled: {
    color: Colors.text.disabled,
  },
  checkBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    padding: Spacing.base,
    backgroundColor: Colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  nextButtonText: {
    color: Colors.background.paper,
    fontWeight: Fonts.weight.semiBold,
    fontSize: Fonts.size.md,
  },
  disabledButton: {
    backgroundColor: Colors.neutral[300],
  },
});
