import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { DoorOpen, Bed, ChevronDown, AlertCircle } from 'lucide-react-native';
import { RoomType } from './RoomTypeSelector';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';

interface RoomAssignmentCardProps {
  roomNumber: string;
  selectedType: RoomType | null;
  availableTypes: RoomType[];
  onPress: () => void;
}

export default function RoomAssignmentCard({
  roomNumber,
  selectedType,
  availableTypes,
  onPress,
}: RoomAssignmentCardProps) {
  const theme = useTheme();

  const hasSelection = selectedType !== null;

  return (
    <Animated.View
      entering={FadeIn}
      layout={Layout.springify()}
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: hasSelection ? theme.primary : theme.cardBorder,
          borderWidth: hasSelection ? 2 : 1,
        },
      ]}
    >
      <View style={styles.roomInfo}>
        <View
          style={[
            styles.roomIcon,
            {
              backgroundColor: hasSelection
                ? theme.primary + '15'
                : theme.inputBackground,
            },
          ]}
        >
          <DoorOpen
            size={20}
            color={hasSelection ? theme.primary : theme.textSecondary}
            strokeWidth={2}
          />
        </View>
        <View style={styles.roomDetails}>
          <Text style={[styles.roomNumber, { color: theme.text }]}>
            Room {roomNumber}
          </Text>
          {hasSelection ? (
            <View style={styles.selectionContainer}>
              <Text
                style={[styles.selectionText, { color: theme.textSecondary }]}
              >
                {selectedType.label}
              </Text>
              <View style={styles.bedsPreview}>
                {Array.from({ length: selectedType.bedCount }).map(
                  (_, index) => (
                    <Bed
                      key={index}
                      size={12}
                      color={theme.textSecondary}
                      strokeWidth={2}
                    />
                  )
                )}
              </View>
            </View>
          ) : (
            <View style={styles.warningContainer}>
              <AlertCircle size={14} color={theme.warning} strokeWidth={2} />
              <Text style={[styles.warningText, { color: theme.warning }]}>
                Select room type
              </Text>
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.selectButton,
          {
            backgroundColor: hasSelection
              ? theme.primary
              : theme.inputBackground,
          },
        ]}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.selectButtonText,
            { color: hasSelection ? '#ffffff' : theme.text },
          ]}
        >
          {hasSelection ? 'Change' : 'Select'}
        </Text>
        <ChevronDown
          size={16}
          color={hasSelection ? '#ffffff' : theme.text}
          strokeWidth={2}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
  },
  roomInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roomIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomDetails: {
    flex: 1,
    gap: 4,
  },
  roomNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  bedsPreview: {
    flexDirection: 'row',
    gap: 4,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  warningText: {
    fontSize: 13,
    fontWeight: '600',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 4,
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
