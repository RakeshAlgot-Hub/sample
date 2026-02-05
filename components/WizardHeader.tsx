import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { X } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

interface WizardHeaderProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  onClose: () => void;
}

export default function WizardHeader({
  currentStep,
  totalSteps,
  title,
  onClose,
}: WizardHeaderProps) {
  const theme = useTheme();
  const progress = (currentStep / totalSteps) * 100;

  const progressStyle = useAnimatedStyle(() => ({
    width: withTiming(`${progress}%`, { duration: 300 }),
  }));

  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.stepText, { color: theme.textSecondary }]}>
            Step {currentStep} of {totalSteps}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onClose}
          style={[styles.closeButton, { backgroundColor: theme.inputBackground }]}
          activeOpacity={0.7}
        >
          <X size={20} color={theme.text} strokeWidth={2} />
        </TouchableOpacity>
      </View>
      <View style={[styles.progressContainer, { backgroundColor: theme.border }]}>
        <Animated.View
          style={[
            styles.progressBar,
            { backgroundColor: theme.primary },
            progressStyle,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
  },
  titleContainer: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  stepText: {
    fontSize: 14,
    fontWeight: '500',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    height: 4,
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
});
