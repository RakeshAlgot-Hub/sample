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
  Modal,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { useWizardStore } from '@/store/useWizardStore';
import WizardHeader from '@/components/WizardHeader';
import WizardTopHeader from '@/components/WizardTopHeader';
import WizardFooter from '@/components/WizardFooter';
import { Bed, X } from 'lucide-react-native';

const AVAILABLE_BED_COUNTS = [2, 3, 4, 5];

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
  const [pricingByCount, setPricingByCount] = useState<
    Record<number, { dailyPrice: string; monthlyPrice: string }>
  >({});
  const [pricingModalVisible, setPricingModalVisible] = useState(false);
  const [activePricingCount, setActivePricingCount] = useState<number | null>(null);
  const [dailyPriceInput, setDailyPriceInput] = useState('');
  const [monthlyPriceInput, setMonthlyPriceInput] = useState('');

  const mergedCounts = useMemo(() => {
    const merged = [...AVAILABLE_BED_COUNTS, ...customCounts];
    return Array.from(new Set(merged)).sort((a, b) => a - b);
  }, [customCounts]);

  useEffect(() => {
    setSelectedCounts(allowedBedCounts);
    const custom = allowedBedCounts.filter((count) => count > 6);
    setCustomCounts(custom);
    const mapped: Record<number, { dailyPrice: string; monthlyPrice: string }> = {};

    bedPricing.forEach((pricing) => {
      mapped[pricing.bedCount] = {
        dailyPrice: pricing.dailyPrice?.toString() ?? '',
        monthlyPrice: pricing.monthlyPrice?.toString() ?? '',
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

  const openPricingModal = (count: number) => {
    const existing = pricingByCount[count];
    setActivePricingCount(count);
    setDailyPriceInput(existing?.dailyPrice ?? '');
    setMonthlyPriceInput(existing?.monthlyPrice ?? '');
    setPricingModalVisible(true);
  };

  const handleToggleBedCount = (count: number) => {
    openPricingModal(count);
  };

  const handleAddCustom = () => {
    const parsed = Number(customCount.trim());
    if (!Number.isInteger(parsed) || parsed < 6) {
      return;
    }

    setCustomCounts((prev) => Array.from(new Set([...prev, parsed])).sort((a, b) => a - b));
    setCustomCount('');
    openPricingModal(parsed);
  };

  const handleNext = () => {
    if (!selectedCounts.length) {
      return;
    }

    const invalidCount = selectedCounts.find((count) => {
      const entry = pricingByCount[count];
      const parsedDaily = Number(entry?.dailyPrice ?? '');
      const parsedMonthly = Number(entry?.monthlyPrice ?? '');
      return (
        !entry?.dailyPrice ||
        !entry?.monthlyPrice ||
        !Number.isInteger(parsedDaily) ||
        !Number.isInteger(parsedMonthly) ||
        parsedDaily <= 0 ||
        parsedMonthly <= 0
      );
    });

    if (invalidCount) {
      Alert.alert('Price required', `Enter a valid amount for ${invalidCount} beds.`);
      return;
    }

    updateAllowedBedCounts(selectedCounts);
    const pricing = selectedCounts.map((count) => {
      const entry = pricingByCount[count] ?? { dailyPrice: '', monthlyPrice: '' };
      const parsedDaily = Number(entry.dailyPrice);
      const parsedMonthly = Number(entry.monthlyPrice);
      return {
        bedCount: count,
        dailyPrice: parsedDaily,
        monthlyPrice: parsedMonthly,
      };
    });
    updateBedPricing(pricing);
    nextStep();
    router.push('/wizard/rooms');
  };

  const pricingComplete = selectedCounts.every((count) => {
    const entry = pricingByCount[count];
    const parsedDaily = Number(entry?.dailyPrice ?? '');
    const parsedMonthly = Number(entry?.monthlyPrice ?? '');
    return (
      entry?.dailyPrice &&
      entry?.monthlyPrice &&
      Number.isInteger(parsedDaily) &&
      Number.isInteger(parsedMonthly) &&
      parsedDaily > 0 &&
      parsedMonthly > 0
    );
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
          <Text style={[styles.helperText, { color: theme.textSecondary }]}>
            Tap a bed count to set daily and monthly pricing.
          </Text>

          <View style={styles.bedCountContainer}>
            {mergedCounts.map((count) => {
              const isSelected = selectedCounts.includes(count);
              const pricing = pricingByCount[count];
              const hasPricing = Boolean(pricing?.dailyPrice && pricing?.monthlyPrice);
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
                    <View style={styles.inlinePricing}>
                      {hasPricing ? (
                        <View style={styles.priceStack}>
                          <View style={[styles.pricePill, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}
                          >
                            <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>Day</Text>
                            <Text style={[styles.priceValue, { color: theme.text }]}>Rs {pricing?.dailyPrice}</Text>
                          </View>
                          <View style={[styles.pricePill, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}
                          >
                            <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>Month</Text>
                            <Text style={[styles.priceValue, { color: theme.text }]}>Rs {pricing?.monthlyPrice}</Text>
                          </View>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={[styles.setPricingButton, { borderColor: theme.inputBorder }]}
                          onPress={() => handleToggleBedCount(count)}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.setPricingText, { color: theme.textSecondary }]}
                          >
                            Set pricing
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
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
      <Modal
        transparent
        animationType="fade"
        visible={pricingModalVisible}
        onRequestClose={() => {
          setPricingModalVisible(false);
          setActivePricingCount(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Set Pricing</Text>
              <TouchableOpacity
                onPress={() => {
                  setPricingModalVisible(false);
                  setActivePricingCount(null);
                }}
                activeOpacity={0.7}
              >
                <X size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}
            >
              Enter daily and monthly pricing. Both are required.
            </Text>
            <View style={styles.modalInputs}>
              <View style={styles.modalField}>
                <Text style={[styles.modalLabel, { color: theme.text }]}>Daily Price</Text>
                <TextInput
                  style={[
                    styles.modalInput,
                    { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.text },
                  ]}
                  placeholder="e.g. 150"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="number-pad"
                  value={dailyPriceInput}
                  onChangeText={(value) => setDailyPriceInput(value.replace(/\D+/g, ''))}
                />
              </View>
              <View style={styles.modalField}>
                <Text style={[styles.modalLabel, { color: theme.text }]}>Monthly Price</Text>
                <TextInput
                  style={[
                    styles.modalInput,
                    { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.text },
                  ]}
                  placeholder="e.g. 4500"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="number-pad"
                  value={monthlyPriceInput}
                  onChangeText={(value) => setMonthlyPriceInput(value.replace(/\D+/g, ''))}
                />
              </View>
            </View>
            <View style={styles.modalActions}>
              {activePricingCount !== null && selectedCounts.includes(activePricingCount) && (
                <TouchableOpacity
                  style={[styles.modalButton, styles.removeButton, { borderColor: theme.error }]}
                  onPress={() => {
                    setSelectedCounts((prev) => prev.filter((count) => count !== activePricingCount));
                    setPricingByCount((current) => {
                      const next = { ...current };
                      delete next[activePricingCount];
                      return next;
                    });
                    setPricingModalVisible(false);
                    setActivePricingCount(null);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.modalButtonText, { color: theme.error }]}>Remove</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.accent }]}
                onPress={() => {
                  const parsedDaily = Number(dailyPriceInput);
                  const parsedMonthly = Number(monthlyPriceInput);
                  if (!parsedDaily || !parsedMonthly) {
                    Alert.alert('Pricing required', 'Enter valid daily and monthly amounts.');
                    return;
                  }

                  if (activePricingCount === null) {
                    return;
                  }

                  setPricingByCount((current) => ({
                    ...current,
                    [activePricingCount]: {
                      dailyPrice: dailyPriceInput,
                      monthlyPrice: monthlyPriceInput,
                    },
                  }));
                  setSelectedCounts((prev) =>
                    Array.from(new Set([...prev, activePricingCount])).sort((a, b) => a - b)
                  );
                  setPricingModalVisible(false);
                  setActivePricingCount(null);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.modalButtonPrimaryText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  helperText: {
    fontSize: 12,
    lineHeight: 18,
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
  priceStack: {
    flexDirection: 'row',
    gap: 6,
  },
  pricePill: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 2,
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  priceValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  setPricingButton: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setPricingText: {
    fontSize: 12,
    fontWeight: '600',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 12,
    lineHeight: 18,
  },
  modalInputs: {
    gap: 10,
  },
  modalField: {
    gap: 6,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalInput: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  modalButton: {
    minWidth: 88,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  modalButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalButtonPrimaryText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  removeButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
});
