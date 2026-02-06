import { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { useWizardStore } from '@/store/useWizardStore';
import WizardHeader from '@/components/WizardHeader';
import WizardFooter from '@/components/WizardFooter';
import { Bed } from 'lucide-react-native';

const AVAILABLE_BED_COUNTS = [1, 2, 3, 4, 5, 6];

export default function ShareTypesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { allowedBedCounts, updateAllowedBedCounts, nextStep, previousStep, resetWizard } = useWizardStore();

  const [selectedCounts, setSelectedCounts] = useState<number[]>(allowedBedCounts);
  const [customCount, setCustomCount] = useState('');
  const [customCounts, setCustomCounts] = useState<number[]>([]);

  const mergedCounts = useMemo(() => {
    const merged = [...AVAILABLE_BED_COUNTS, ...customCounts];
    return Array.from(new Set(merged)).sort((a, b) => a - b);
  }, [customCounts]);

  useEffect(() => {
    setSelectedCounts(allowedBedCounts);
    const custom = allowedBedCounts.filter((count) => count > 6);
    setCustomCounts(custom);
  }, [allowedBedCounts]);

  const handleClose = () => {
    resetWizard();
    router.back();
  };

  const handleBack = () => {
    previousStep();
    router.back();
  };

  const handleToggleBedCount = (count: number) => {
    setSelectedCounts((prev) => {
      if (prev.includes(count)) {
        return prev.filter((c) => c !== count);
      } else {
        return [...prev, count].sort((a, b) => a - b);
      }
    });
  };

  const handleAddCustom = () => {
    const parsed = Number(customCount.trim());
    if (!Number.isInteger(parsed) || parsed < 7) {
      return;
    }

    setCustomCounts((prev) => Array.from(new Set([...prev, parsed])).sort((a, b) => a - b));
    setSelectedCounts((prev) => Array.from(new Set([...prev, parsed])).sort((a, b) => a - b));
    setCustomCount('');
  };

  const handleNext = () => {
    updateAllowedBedCounts(selectedCounts);
    nextStep();
    router.push('/wizard/rooms');
  };

  const canProceed = selectedCounts.length > 0;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <WizardHeader
        currentStep={4}
        totalSteps={6}
        title="Share Types"
        onClose={handleClose}
        showClose={false}
        showSteps={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <View style={styles.labelContainer}>
            <Bed size={18} color={theme.textSecondary} strokeWidth={2} />
            <Text style={[styles.label, { color: theme.text }]}>
              Select Allowed Bed Counts per Room
            </Text>
          </View>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            These represent the different room configurations your property supports.
          </Text>

          <View style={styles.bedCountContainer}>
            {mergedCounts.map((count) => {
              const isSelected = selectedCounts.includes(count);
              return (
                <TouchableOpacity
                  key={count}
                  style={[
                    styles.bedCountButton,
                    {
                      backgroundColor: isSelected
                        ? theme.primary + '15'
                        : theme.inputBackground,
                      borderColor: isSelected ? theme.primary : theme.inputBorder,
                    },
                  ]}
                  onPress={() => handleToggleBedCount(count)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.bedCountText,
                      {
                        color: isSelected ? theme.primary : theme.text,
                        fontWeight: isSelected ? '600' : '500',
                      },
                    ]}
                  >
                    {count} {count === 1 ? 'Bed' : 'Beds'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.customSection}>
            <Text style={[styles.customLabel, { color: theme.textSecondary }]}>Custom beds (7+)</Text>
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
        showBack={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  bedCountContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  bedCountButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bedCountText: {
    fontSize: 16,
  },
  customSection: {
    gap: 8,
    marginTop: 8,
  },
  customLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  customInput: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  customButton: {
    height: 46,
    paddingHorizontal: 18,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
