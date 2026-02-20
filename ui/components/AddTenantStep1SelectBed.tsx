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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Bed</Text>
          <Text style={styles.subtitle}>
            Choose an available bed for the new tenant
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading available beds...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {availableUnits.length === 0 ? (
              <View style={styles.emptyState}>
                <Bed size={48} color={Colors.neutral[400]} strokeWidth={1.5} />
                <Text style={styles.emptyText}>No available beds</Text>
                <Text style={styles.emptySubtext}>
                  All beds are currently occupied
                </Text>
              </View>
            ) : (
              availableUnits.map((unit) => {
                const { building, floor, room } = getBedInfo(unit);
                const isSelected = selectedUnitId === unit.id;
                const isDisabled = unit.status === 'occupied';

                return (
                  <TouchableOpacity
                    key={unit.id}
                    style={[
                      styles.bedOption,
                      isSelected && styles.selectedBed,
                      isDisabled && styles.disabledBed,
                    ]}
                    disabled={isDisabled}
                    onPress={() => onSelect(unit.id)}>
                    <View style={styles.bedIconContainer}>
                      <Bed
                        size={20}
                        color={
                          isSelected
                            ? Colors.primary
                            : isDisabled
                            ? Colors.neutral[400]
                            : Colors.text.secondary
                        }
                      />
                    </View>
                    <View style={styles.bedInfo}>
                      <Text
                        style={[
                          styles.bedTitle,
                          isDisabled && styles.disabledText,
                        ]}>
                        Bed {unit.bedNumber}
                      </Text>
                      <Text
                        style={[
                          styles.bedDetails,
                          isDisabled && styles.disabledText,
                        ]}>
                        Building {building} • Floor {floor} • Room {room}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={styles.checkContainer}>
                        <Check size={20} color={Colors.primary} strokeWidth={3} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, !selectedUnitId && styles.disabledButton]}
          onPress={onNext}
          disabled={!selectedUnitId}>
          <Text style={styles.nextButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background.paper,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.base,
  },
  title: {
    fontSize: Fonts.size.xxxl,
    fontWeight: Fonts.weight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Fonts.size.base,
    color: Colors.text.secondary,
    lineHeight: 20,
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
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
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
  bedOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.paper,
    borderWidth: 1,
    borderColor: Colors.border.medium,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
  },
  selectedBed: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: Colors.background.elevated,
  },
  disabledBed: {
    opacity: 0.5,
  },
  bedIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  bedInfo: {
    flex: 1,
  },
  bedTitle: {
    fontSize: Fonts.size.md,
    fontWeight: Fonts.weight.semiBold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  bedDetails: {
    fontSize: Fonts.size.sm,
    color: Colors.text.secondary,
  },
  disabledText: {
    color: Colors.text.disabled,
  },
  checkContainer: {
    marginLeft: Spacing.md,
  },
  footer: {
    padding: Spacing.base,
    backgroundColor: Colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    padding: Spacing.base,
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
