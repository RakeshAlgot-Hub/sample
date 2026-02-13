import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { X } from 'lucide-react-native';

interface WizardHeaderProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  onClose: () => void;
  showClose?: boolean;
  showSteps?: boolean;
  showTitle?: boolean;
}

export default function WizardHeader({
  currentStep,
  totalSteps,
  title,
  onClose,
  showClose = true,
  showSteps = true,
  showTitle = true,
}: WizardHeaderProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, !showClose && styles.headerNoClose]}>
        <View style={styles.titleContainer}>
          {showTitle && (
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          )}
        </View>
        {showClose && (
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeButton, { backgroundColor: theme.inputBackground }]}
            activeOpacity={0.7}
          >
            <X size={20} color={theme.text} strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>
      {showSteps && (
        <View style={styles.progressWrapper}>
          <View style={styles.progressMeta}>
            <Text style={[styles.stepText, { color: theme.textSecondary }]}>Step {currentStep} of {totalSteps}</Text>
            <Text style={[styles.stepPercent, { color: theme.textSecondary }]}>
              {Math.round((currentStep / totalSteps) * 100)}%
            </Text>
          </View>
          <View style={styles.segmentRow}>
            {Array.from({ length: totalSteps }).map((_, index) => {
              const isComplete = index + 1 <= currentStep;
              return (
                <View
                  key={`step-${index}`}
                  style={[
                    styles.segment,
                    {
                      backgroundColor: isComplete ? theme.primary : theme.border,
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingBottom: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
  },
  headerNoClose: {
    justifyContent: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  stepText: {
    fontSize: 12,
    fontWeight: '600',
  },
  stepPercent: {
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressWrapper: {
    gap: 8,
    paddingHorizontal: 16,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 6,
  },
  segment: {
    flex: 1,
    height: 6,
    borderRadius: 999,
  },
});
