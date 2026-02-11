import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { Bed, CheckCircle2 } from 'lucide-react-native';

export interface RoomType {
  id: string;
  label: string;
  bedCount: number;
}

interface RoomTypeSelectorProps {
  selectedTypes: RoomType[];
  onToggle: (type: RoomType) => void;
  customBedCount: string;
  onCustomBedCountChange: (count: string) => void;
}

const PRESET_ROOM_TYPES: RoomType[] = [
  { id: 'single', label: 'Single Bed', bedCount: 1 },
  { id: 'double', label: 'Double Bed', bedCount: 2 },
  { id: 'triple', label: 'Triple Bed', bedCount: 3 },
  { id: '4bed', label: '4 Bed', bedCount: 4 },
  { id: '5bed', label: '5 Bed', bedCount: 5 },
];

export default function RoomTypeSelector({
  selectedTypes,
  onToggle,
  customBedCount,
  onCustomBedCountChange,
}: RoomTypeSelectorProps) {
  const theme = useTheme();

  const isSelected = (typeId: string) =>
    selectedTypes.some((t) => t.id === typeId);

  const customSelected = selectedTypes.some((t) => t.id === 'custom');

  const handleCustomToggle = () => {
    if (customSelected) {
      const filtered = selectedTypes.filter((t) => t.id !== 'custom');
      onToggle({ id: 'custom', label: 'Custom', bedCount: 0 });
    } else {
      onToggle({
        id: 'custom',
        label: 'Custom',
        bedCount: parseInt(customBedCount) || 0,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.text }]}>
        Select Room Types
        <Text style={[styles.required, { color: theme.accent }]}> *</Text>
      </Text>
      <Text style={[styles.hint, { color: theme.textSecondary }]}>
        Choose one or more room types for this floor
      </Text>

      <View style={styles.typesGrid}>
        {PRESET_ROOM_TYPES.map((type) => {
          const selected = isSelected(type.id);
          return (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeButton,
                {
                  backgroundColor: selected
                    ? theme.primary + '15'
                    : theme.card,
                  borderColor: selected ? theme.primary : theme.cardBorder,
                },
              ]}
              onPress={() => onToggle(type)}
              activeOpacity={0.7}
            >
              {selected && (
                <CheckCircle2
                  size={20}
                  color={theme.primary}
                  strokeWidth={2}
                  style={styles.checkIcon}
                />
              )}
              <View style={styles.typeContent}>
                <Text
                  style={[
                    styles.typeLabel,
                    {
                      color: selected ? theme.primary : theme.text,
                      fontWeight: selected ? '700' : '600',
                    },
                  ]}
                >
                  {type.label}
                </Text>
                <View style={styles.bedsPreview}>
                  {Array.from({ length: type.bedCount }).map((_, index) => (
                    <Bed
                      key={index}
                      size={14}
                      color={selected ? theme.primary : theme.textSecondary}
                      strokeWidth={2}
                    />
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={[
            styles.typeButton,
            {
              backgroundColor: customSelected
                ? theme.primary + '15'
                : theme.card,
              borderColor: customSelected ? theme.primary : theme.cardBorder,
            },
          ]}
          onPress={handleCustomToggle}
          activeOpacity={0.7}
        >
          {customSelected && (
            <CheckCircle2
              size={20}
              color={theme.primary}
              strokeWidth={2}
              style={styles.checkIcon}
            />
          )}
          <View style={styles.typeContent}>
            <Text
              style={[
                styles.typeLabel,
                {
                  color: customSelected ? theme.primary : theme.text,
                  fontWeight: customSelected ? '700' : '600',
                },
              ]}
            >
              Custom
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {customSelected && (
        <View style={styles.customInputContainer}>
          <Text style={[styles.customLabel, { color: theme.text }]}>
            Number of beds in custom room type
          </Text>
          <TextInput
            style={[
              styles.customInput,
              {
                backgroundColor: theme.inputBackground,
                borderColor: theme.inputBorder,
                color: theme.text,
              },
            ]}
            placeholder="Enter bed count"
            placeholderTextColor={theme.textSecondary}
            value={customBedCount}
            onChangeText={onCustomBedCountChange}
            keyboardType="number-pad"
            autoFocus
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  required: {
    fontSize: 16,
  },
  hint: {
    fontSize: 14,
    lineHeight: 20,
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeButton: {
    width: '47%',
    minHeight: 80,
    borderRadius: 12,
    borderWidth: 2,
    padding: 12,
    justifyContent: 'center',
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  typeContent: {
    alignItems: 'center',
    gap: 8,
  },
  typeLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  bedsPreview: {
    flexDirection: 'row',
    gap: 4,
  },
  customInputContainer: {
    gap: 8,
    marginTop: 4,
  },
  customLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  customInput: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
});
