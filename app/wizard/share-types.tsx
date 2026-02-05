import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { useWizardStore } from '@/store/useWizardStore';
import WizardHeader from '@/components/WizardHeader';
import WizardFooter from '@/components/WizardFooter';
import { Bed } from 'lucide-react-native';

const AVAILABLE_BED_COUNTS = [1, 2, 3, 4, 5, 6, 7];

export default function ShareTypesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { allowedBedCounts, updateAllowedBedCounts, nextStep, previousStep, resetWizard } = useWizardStore();

  const [selectedCounts, setSelectedCounts] = useState<number[]>(allowedBedCounts);

  useEffect(() => {
    setSelectedCounts(allowedBedCounts);
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
            {AVAILABLE_BED_COUNTS.map((count) => {
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
});
