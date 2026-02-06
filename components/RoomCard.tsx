import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Room } from '@/types/property';
import { useTheme } from '@/theme/useTheme';
import { DoorOpen, Trash2, Bed } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';

interface RoomCardProps {
  room: Room;
  onRemove: () => void;
}

const getShareTypeLabel = (shareType: string): string => {
  return shareType.charAt(0).toUpperCase() + shareType.slice(1);
};

const getRoomLabel = (room: Room): string => {
  const count = room.bedCount ?? room.beds.length;
  if (count > 3) {
    return `${count} Beds`;
  }

  return getShareTypeLabel(room.shareType);
};

export default function RoomCard({ room, onRemove }: RoomCardProps) {
  const theme = useTheme();

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      layout={Layout.springify()}
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.cardBorder },
      ]}
    >
      <View style={styles.roomInfo}>
        <View
          style={[styles.roomIcon, { backgroundColor: theme.primary + '15' }]}
        >
          <DoorOpen size={20} color={theme.primary} strokeWidth={2} />
        </View>
        <View style={styles.roomDetails}>
          <Text style={[styles.roomNumber, { color: theme.text }]}>
            Room {room.roomNumber}
          </Text>
          <View style={styles.shareTypeContainer}>
            <Text style={[styles.shareType, { color: theme.textSecondary }]}>
              {getRoomLabel(room)}
            </Text>
            <View style={styles.bedPreview}>
              {room.beds.map((bed) => (
                <Bed
                  key={bed.id}
                  size={14}
                  color={theme.textSecondary}
                  strokeWidth={2}
                />
              ))}
            </View>
          </View>
        </View>
      </View>
      <TouchableOpacity
        onPress={onRemove}
        style={[styles.removeButton, { backgroundColor: theme.error + '15' }]}
        activeOpacity={0.7}
      >
        <Trash2 size={16} color={theme.error} strokeWidth={2} />
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
    borderWidth: 1,
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
  shareTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shareType: {
    fontSize: 14,
    fontWeight: '500',
  },
  bedPreview: {
    flexDirection: 'row',
    gap: 4,
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
