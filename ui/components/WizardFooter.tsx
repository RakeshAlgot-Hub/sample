import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

interface WizardFooterProps {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showBack?: boolean;
}

export default function WizardFooter({
  onBack,
  onNext,
  nextLabel = 'Next',
  nextDisabled = false,
  showBack = true,
}: WizardFooterProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background, borderTopColor: 'transparent' },
      ]}
    >
      {showBack && onBack ? (
        <TouchableOpacity
          onPress={onBack}
          style={[
            styles.button,
            styles.backButton,
            { backgroundColor: theme.inputBackground },
          ]}
          activeOpacity={0.7}
        >
          <ChevronLeft size={20} color={theme.text} strokeWidth={2} />
          <Text style={[styles.buttonText, { color: theme.text }]}>Back</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}

      {onNext && (
        <TouchableOpacity
          onPress={onNext}
          style={[
            styles.button,
            styles.nextButton,
            { backgroundColor: nextDisabled ? theme.inputBorder : theme.accent },
          ]}
          activeOpacity={0.7}
          disabled={nextDisabled}
        >
          <Text style={styles.nextButtonText}>{nextLabel}</Text>
          <ChevronRight size={20} color="#ffffff" strokeWidth={2} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 0,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    paddingHorizontal: 18,
    borderRadius: 12,
    gap: 6,
  },
  backButton: {
    minWidth: 90,
  },
  nextButton: {
    minWidth: 110,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  spacer: {
    width: 90,
  },
});
