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
}

export default function WizardHeader({
  currentStep,
  totalSteps,
  title,
  onClose,
  showClose = true,
  showSteps = true,
}: WizardHeaderProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, !showClose && styles.headerNoClose]}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          {showSteps && (
            <Text style={[styles.stepText, { color: theme.textSecondary }]}>
              Step {currentStep} of {totalSteps}
            </Text>
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
        <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: theme.primary,
                width: `${Math.max(0, Math.min(1, currentStep / totalSteps)) * 100}%`,
              },
            ]}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 6,
    paddingBottom: 8,
    gap: 8,
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
    fontSize: 16,
    fontWeight: '700',
  },
  stepText: {
    fontSize: 12,
    fontWeight: '500',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressTrack: {
    height: 4,
    marginHorizontal: 16,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
