import { useMemo, useState, useEffect, useCallback } from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  BackHandler,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { useWizardStore } from '@/store/useWizardStore';
import WizardHeader from '@/components/WizardHeader';
import WizardTopHeader from '@/components/WizardTopHeader';
import WizardFooter from '@/components/WizardFooter';
import { Bed } from 'lucide-react-native';
import { BillingPeriod } from '@/types/property';

const AVAILABLE_BED_COUNTS = [2, 3, 4, 5];
const PERIODS: BillingPeriod[] = ['monthly', 'weekly', 'hourly', 'yearly'];

export default function ShareTypesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const {
    allowedBedCounts,
    bedPricing,
    updateAllowedBedCounts,
    updateBedPricing,
    nextStep,
    previousStep,
    resetWizard,
    editingPropertyId,
  } = useWizardStore();

  const [selectedCounts, setSelectedCounts] = useState<number[]>(allowedBedCounts);
  const [customCount, setCustomCount] = useState('');
  const [customCounts, setCustomCounts] = useState<number[]>([]);
  const [pricingByCount, setPricingByCount] = useState<Record<number, { price: string; period: BillingPeriod }>>({});

  const mergedCounts = useMemo(() => {
    const merged = [...AVAILABLE_BED_COUNTS, ...customCounts];
    return Array.from(new Set(merged)).sort((a, b) => a - b);
  }, [customCounts]);

  useEffect(() => {
    setSelectedCounts(allowedBedCounts);
    const custom = allowedBedCounts.filter((count) => count > 6);
    setCustomCounts(custom);
    const mapped: Record<number, { price: string; period: BillingPeriod }> = {};

    bedPricing.forEach((pricing) => {
      mapped[pricing.bedCount] = {
        price: pricing.price.toString(),
        period: pricing.period,
      };
    });

    setPricingByCount(mapped);
  }, [allowedBedCounts, bedPricing]);

  const handleClose = useCallback(() => {
    resetWizard();
    if (editingPropertyId) {
      router.replace({
        pathname: '/settings/property-details/[id]',
        params: { id: editingPropertyId },
      });
      return;
    }
    router.replace('/(tabs)');
  }, [resetWizard, router, editingPropertyId]);

  const handleBack = useCallback(() => {
    previousStep();
    router.back();
  }, [previousStep, router]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleBack();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => subscription.remove();
    }, [handleBack]),
  );

  const handleToggleBedCount = (count: number) => {
    setSelectedCounts((prev) => {
      if (prev.includes(count)) {
        setPricingByCount((current) => {
          const next = { ...current };
          delete next[count];
          return next;
        });
        return prev.filter((c) => c !== count);
      } else {
        setPricingByCount((current) => ({
          ...current,
          [count]: current[count] ?? { price: '', period: 'monthly' },
        }));
        return [...prev, count].sort((a, b) => a - b);
      }
    });
  };

  const handleAddCustom = () => {
    const parsed = Number(customCount.trim());
    if (!Number.isInteger(parsed) || parsed < 6) {
      return;
    }

    setCustomCounts((prev) => Array.from(new Set([...prev, parsed])).sort((a, b) => a - b));
    setSelectedCounts((prev) => Array.from(new Set([...prev, parsed])).sort((a, b) => a - b));
    setPricingByCount((current) => ({
      ...current,
      [parsed]: current[parsed] ?? { price: '', period: 'monthly' },
    }));
    setCustomCount('');
  };

  const handleNext = () => {
    if (!selectedCounts.length) {
      return;
    }

    const invalidCount = selectedCounts.find((count) => {
      const entry = pricingByCount[count];
      const parsed = Number(entry?.price ?? '');
      return !entry?.price || !Number.isInteger(parsed) || parsed <= 0;
    });

    if (invalidCount) {
      Alert.alert('Price required', `Enter a valid amount for ${invalidCount} beds.`);
      return;
    }

    updateAllowedBedCounts(selectedCounts);
    const pricing = selectedCounts.map((count) => {
      const entry = pricingByCount[count] ?? { price: '', period: 'monthly' as BillingPeriod };
      const parsed = Number(entry.price);
      return {
        bedCount: count,
        price: parsed,
        period: entry.period,
      };
    });
    updateBedPricing(pricing);
    nextStep();
    router.push('/wizard/rooms');
  };

  const pricingComplete = selectedCounts.every((count) => {
    const entry = pricingByCount[count];
    const parsed = Number(entry?.price ?? '');
    return entry?.price && Number.isInteger(parsed) && parsed > 0;
  });
  const canProceed = selectedCounts.length > 0 && pricingComplete;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <WizardTopHeader
        onBack={handleBack}
        title="Share Types"
        rightAction="close"
        onClose={handleClose}
      />
      <WizardHeader
        currentStep={4}
        totalSteps={6}
        title="Share Types"
        onClose={handleClose}
        showClose={false}
        showSteps
        showTitle={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <View style={styles.labelContainer}>
            <Bed size={16} color={theme.textSecondary} strokeWidth={2} />
            <Text style={[styles.label, { color: theme.text }]}
            >
              Room Types & Pricing
              <Text style={[styles.required, { color: theme.accent }]}> *</Text>
            </Text>
          </View>

          <View style={styles.bedCountContainer}>
            {mergedCounts.map((count) => {
              const isSelected = selectedCounts.includes(count);
              const pricing = pricingByCount[count];
              return (
                <View key={count} style={styles.bedCountCard}>
                  <View
                    style={[
                      styles.cardHeader,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.cardBorder,
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={[
                        styles.bedCountButton,
                        {
                          backgroundColor: isSelected
                            ? theme.primary
                            : theme.inputBackground,
                          borderColor: isSelected ? theme.primary : theme.inputBorder,
                        },
                      ]}
                      onPress={() => handleToggleBedCount(count)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.bedCountText,
                          { color: isSelected ? '#ffffff' : theme.text },
                        ]}
                      >
                        {count} {count === 1 ? 'Bed' : 'Beds'}
                      </Text>
                    </TouchableOpacity>
                    {isSelected && (
                      <View style={styles.inlinePricing}>
                        <TextInput
                          style={[
                            styles.inlinePriceInput,
                            { color: theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder },
                          ]}
                          placeholder="e.g. 4500"
                          placeholderTextColor={theme.textSecondary}
                          keyboardType="number-pad"
                          value={pricing?.price ?? ''}
                          onChangeText={(value) => {
                            const nextValue = value.replace(/\D+/g, '');
                            setPricingByCount((current) => ({
                              ...current,
                              [count]: {
                                price: nextValue,
                                period: current[count]?.period ?? 'monthly',
                              },
                            }));
                          }}
                        />
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={styles.periodRow}
                        >
                          {PERIODS.map((period) => {
                            const isSelected = (pricing?.period ?? 'monthly') === period;
                            return (
                              <TouchableOpacity
                                key={period}
                                style={[
                                  styles.periodOption,
                                  {
                                    backgroundColor: isSelected
                                      ? theme.primary
                                      : theme.inputBackground,
                                    borderColor: isSelected ? theme.primary : theme.inputBorder,
                                  },
                                ]}
                                onPress={() =>
                                  setPricingByCount((current) => ({
                                    ...current,
                                    [count]: {
                                      price: current[count]?.price ?? '',
                                      period,
                                    },
                                  }))
                                }
                                activeOpacity={0.8}
                              >
                                <Text
                                  style={[
                                    styles.periodOptionText,
                                    { color: isSelected ? '#ffffff' : theme.text },
                                  ]}
                                >
                                  {period}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.customSection}>
            <Text style={[styles.customLabel, { color: theme.textSecondary }]}>Custom beds (6+)</Text>
            <View style={styles.customRow}>
              <TextInput
                style={[
                  styles.customInput,
                  {
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.inputBorder,
                    color: theme.text,
                  },
                ]}
                placeholder="e.g. 8"
                placeholderTextColor={theme.textSecondary}
                keyboardType="number-pad"
                value={customCount}
                onChangeText={setCustomCount}
              />
              <TouchableOpacity
                style={[styles.customButton, { backgroundColor: theme.accent }]}
                onPress={handleAddCustom}
                activeOpacity={0.8}
              >
                <Text style={styles.customButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <WizardFooter
        onBack={handleBack}
        onNext={handleNext}
        nextLabel="Next"
        nextDisabled={!canProceed}
        showBack={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
    gap: 14,
  },
  section: {
    gap: 10,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  required: {
    fontSize: 14,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  bedCountContainer: {
    gap: 10,
  },
  bedCountCard: {
    gap: 8,
  },
  cardHeader: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  bedCountButton: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  bedCountText: {
    fontSize: 14,
    fontWeight: '700',
  },
  inlinePricing: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  inlinePriceInput: {
    height: 32,
    minWidth: 70,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 13,
    textAlign: 'right',
  },
  periodRow: {
    alignItems: 'center',
    gap: 5,
  },
  periodOption: {
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodOptionText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  customSection: {
    gap: 8,
    marginTop: 8,
  },
  customLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  customButton: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
});
