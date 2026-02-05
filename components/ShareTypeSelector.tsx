import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ShareType } from '@/types/property';
import { useTheme } from '@/theme/useTheme';
import { Bed } from 'lucide-react-native';

interface ShareTypeSelectorProps {
  value: ShareType | null;
  onChange: (type: ShareType) => void;
}

const SHARE_TYPES: { type: ShareType; label: string; bedCount: number }[] = [
  { type: 'single', label: 'Single', bedCount: 1 },
  { type: 'double', label: 'Double', bedCount: 2 },
  { type: 'triple', label: 'Triple', bedCount: 3 },
];

export default function ShareTypeSelector({
  value,
  onChange,
}: ShareTypeSelectorProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {SHARE_TYPES.map(({ type, label, bedCount }) => {
        const isSelected = value === type;
        return (
          <TouchableOpacity
            key={type}
            style={[
              styles.option,
              {
                backgroundColor: isSelected
                  ? theme.primary + '15'
                  : theme.inputBackground,
                borderColor: isSelected ? theme.primary : theme.inputBorder,
              },
            ]}
            onPress={() => onChange(type)}
            activeOpacity={0.7}
          >
            <View style={styles.optionContent}>
              <Text
                style={[
                  styles.label,
                  {
                    color: isSelected ? theme.primary : theme.text,
                    fontWeight: isSelected ? '600' : '500',
                  },
                ]}
              >
                {label}
              </Text>
              <View style={styles.bedsPreview}>
                {Array.from({ length: bedCount }).map((_, index) => (
                  <Bed
                    key={index}
                    size={16}
                    color={isSelected ? theme.primary : theme.textSecondary}
                    strokeWidth={2}
                  />
                ))}
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
  },
  option: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    padding: 12,
  },
  optionContent: {
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 14,
  },
  bedsPreview: {
    flexDirection: 'row',
    gap: 4,
  },
});
