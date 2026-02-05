import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { CheckCircle2 } from 'lucide-react-native';

const PRESET_FLOORS = ['G', '1', '2', '3', '4'];

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
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customInputText, setCustomInputText] = useState('');

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

  const handleCustomInputChange = (text: string) => {
    setCustomInputText(text);
    const trimmedText = text.trim();
    
    // Create a new array without any previous custom input, but keep presets
    let newSelectedFloors = selectedFloors.filter(f => PRESET_FLOORS.includes(f));

    if (trimmedText && !newSelectedFloors.includes(trimmedText) && !existingFloors.includes(trimmedText)) {
      newSelectedFloors = [...newSelectedFloors, trimmedText];
    }
    onSelectFloors(newSelectedFloors);
  };

  const toggleCustomInput = () => {
    setShowCustomInput(!showCustomInput);
    if (showCustomInput) {
      // If custom input is being hidden, ensure its value is removed from selectedFloors
      const newSelectedFloors = selectedFloors.filter(
        (f) => PRESET_FLOORS.includes(f)
      );
      onSelectFloors(newSelectedFloors);
      setCustomInputText('');
    }
  };

  // Effect to manage customInputText when selectedFloors changes externally
  useEffect(() => {
    const customFloorInSelected = selectedFloors.find(f => !PRESET_FLOORS.includes(f));
    if (customFloorInSelected && customInputText !== customFloorInSelected) {
      setCustomInputText(customFloorInSelected);
      setShowCustomInput(true); // Ensure custom input is visible if its value is set externally
    } else if (!customFloorInSelected && !selectedFloors.some(f => PRESET_FLOORS.includes(f)) && showCustomInput && customInputText) {
      // If no custom floor is selected and custom input is visible but empty, hide it
      setCustomInputText('');
    }
    // If a custom floor was selected and now it's not, clear custom input text
    if (!customFloorInSelected && selectedFloors.every(f => PRESET_FLOORS.includes(f))) {
      setCustomInputText('');
    }
  }, [selectedFloors]);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.text }]}>Select Floor(s)</Text>

      <View style={styles.floorsGrid}>
        {PRESET_FLOORS.map((floor) => {
          const isSelected = selectedFloors.includes(floor);
          const isDuplicate = existingFloors.includes(floor);

          return (
            <TouchableOpacity
              key={floor}
              style={[
                styles.floorButton,
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

        <TouchableOpacity
          style={[
            styles.floorButton,
            {
              backgroundColor: showCustomInput
                ? theme.primary
                : theme.card,
              borderColor: showCustomInput ? theme.primary : theme.cardBorder,
            },
          ]}
          onPress={toggleCustomInput}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.floorButtonText,
              {
                color: showCustomInput ? '#ffffff' : theme.text,
              },
            ]}
          >
            Custom
          </Text>
        </TouchableOpacity>
      </View>

      {showCustomInput && (
        <TextInput
          style={[
            styles.customInput,
            {
              backgroundColor: theme.inputBackground,
              borderColor: theme.inputBorder,
              color: theme.text,
            },
          ]}
          placeholder="Enter custom floor label"
          placeholderTextColor={theme.textSecondary}
          value={customInputText}
          onChangeText={handleCustomInputChange}
          autoCapitalize="characters"
          maxLength={10}
          autoFocus
        />
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
  floorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  floorButton: {
    flexDirection: 'row', // Added to align icon and text
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
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
});

