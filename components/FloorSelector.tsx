import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useTheme } from '@/theme/useTheme';

const PRESET_FLOORS = ['G', '1', '2', '3'];

interface FloorSelectorProps {
  selectedFloors: string[];
  onSelectFloors: (floors: string[]) => void;
  existingFloors: string[];
}

export default function FloorSelector({
  selectedFloors,
  onSelectFloors,
  existingFloors,
}: FloorSelectorProps) {
  const theme = useTheme();
  const [customInputText, setCustomInputText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handlePresetFloorSelect = (floor: string) => {
    if (existingFloors.includes(floor)) {
      return;
    }

    let newSelectedFloors: string[];
    if (selectedFloors.includes(floor)) {
      newSelectedFloors = selectedFloors.filter((f) => f !== floor);
    } else {
      newSelectedFloors = [...selectedFloors, floor];
    }
    onSelectFloors(newSelectedFloors);
  };

  // Get duplicate floors from the input
  const getDuplicateFloors = (text: string): string[] => {
    if (!text.trim()) return [];
    
    const floors = text
      .split(',')
      .map(f => f.trim().toUpperCase())
      .filter(f => f.length > 0);
    
    return floors.filter(
      floor =>
        selectedFloors.includes(floor) ||
        existingFloors.includes(floor) ||
        PRESET_FLOORS.includes(floor)
    );
  };

  const handleCustomInputChange = (text: string) => {
    setCustomInputText(text);
    const trimmedText = text.trim();
    
    // Check for duplicates
    const duplicates = getDuplicateFloors(text);
    if (duplicates.length > 0) {
      setErrorMessage(`Already there: ${duplicates.join(', ')}`);
      return;
    } else {
      setErrorMessage('');
    }

    // Keep only preset floors that were explicitly selected via buttons
    let newSelectedFloors = selectedFloors.filter(f => PRESET_FLOORS.includes(f));

    if (trimmedText) {
      // Parse comma-separated values
      const floors = trimmedText
        .split(',')
        .map(f => f.trim().toUpperCase())
        .filter(f => f.length > 0 && !PRESET_FLOORS.includes(f) && !existingFloors.includes(f));

      newSelectedFloors = [...newSelectedFloors, ...floors];
    }

    onSelectFloors(newSelectedFloors);
  };


  // Effect to manage customInputText when selectedFloors changes externally
  useEffect(() => {
    const customFloorInSelected = selectedFloors.find(f => !PRESET_FLOORS.includes(f));
    if (customFloorInSelected && customInputText !== customFloorInSelected) {
      setCustomInputText(customFloorInSelected);
    }
    // If a custom floor was selected and now it's not, clear custom input text
    if (!customFloorInSelected && selectedFloors.every(f => PRESET_FLOORS.includes(f))) {
      setCustomInputText('');
      setErrorMessage('');
    }
  }, [selectedFloors]);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.text }]}>Select Floor(s)</Text>
      <View style={styles.floorsGrid}>
        <View style={styles.presetsRow}>
          {PRESET_FLOORS.map((floor) => {
            const isSelected = selectedFloors.includes(floor);
            const isDuplicate = existingFloors.includes(floor);

            return (
              <TouchableOpacity
                key={floor}
                style={[
                  styles.presetButton,
                  {
                    backgroundColor: isSelected
                      ? theme.primary
                      : isDuplicate
                        ? theme.inputBackground
                        : theme.card,
                    borderColor: isSelected ? theme.primary : theme.cardBorder,
                    opacity: isDuplicate ? 0.5 : 1,
                  },
                ]}
                onPress={() => handlePresetFloorSelect(floor)}
                disabled={isDuplicate}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.floorButtonText,
                    {
                      color: isSelected
                        ? '#ffffff'
                        : isDuplicate
                          ? theme.textSecondary
                          : theme.text,
                    },
                  ]}
                >
                  {floor}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TextInput
          style={[
            styles.customInput,
            {
              backgroundColor: theme.inputBackground,
              borderColor: errorMessage ? '#EF4444' : theme.inputBorder,
              color: theme.text,
            },
          ]}
          placeholder="e.g., 4, 5, 6, B1, B2, T, 12, 15"
          placeholderTextColor={theme.textSecondary}
          value={customInputText}
          onChangeText={handleCustomInputChange}
          autoCapitalize="characters"
        />
        {errorMessage && (
          <Text style={[styles.errorText, { color: '#EF4444' }]}>
            {errorMessage}
          </Text>
        )}
      </View>
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
  floorsGrid: {
    gap: 12,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  presetButton: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    gap: 6,
  },
  floorButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  customInput: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: -8,
  },
});

