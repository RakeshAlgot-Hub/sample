import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Room } from '@/types/property';
import { useTheme } from '@/theme/useTheme';
import { DoorOpen, ChevronDown, ChevronRight } from 'lucide-react-native';
import BedStatusBadge from './BedStatusBadge';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';

interface RoomDetailCardProps {
  room: Room;
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

export default function RoomDetailCard({ room }: RoomDetailCardProps) {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const totalBeds = room.beds.length;
  const occupiedBeds = room.beds.filter((bed) => bed.occupied).length;
  const availableBeds = totalBeds - occupiedBeds;

  return (
    <Animated.View
      entering={FadeIn}
      layout={Layout.springify()}
      style={[
        styles.container,
        { backgroundColor: theme.background, borderColor: theme.border },
      ]}
    >
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.roomInfo}>
          <View style={[styles.roomIcon, { backgroundColor: theme.primary + '15' }]}>
            <DoorOpen size={14} color={theme.primary} strokeWidth={2} />
          </View>
          <View style={styles.roomText}>
            <Text style={[styles.roomNumber, { color: theme.text }]}>
              Room {room.roomNumber}
            </Text>
            <Text style={[styles.shareType, { color: theme.textSecondary }]}>
              {getRoomLabel(room)} • {totalBeds} {totalBeds === 1 ? 'Bed' : 'Beds'}
            </Text>
          </View>
        </View>
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryDot, { backgroundColor: theme.success }]} />
            <Text style={[styles.summaryText, { color: theme.success }]}>
              {availableBeds}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryDot, { backgroundColor: theme.error }]} />
            <Text style={[styles.summaryText, { color: theme.error }]}>
              {occupiedBeds}
            </Text>
          </View>
        </View>
        {isExpanded ? (
          <ChevronDown size={16} color={theme.textSecondary} strokeWidth={2} />
        ) : (
          <ChevronRight size={16} color={theme.textSecondary} strokeWidth={2} />
        )}
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.bedsContainer}>
          {room.beds.map((bed) => (
            <BedStatusBadge
              key={bed.id}
              bedId={bed.id}
              occupied={bed.occupied}
            />
          ))}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    gap: 8,
  },
  roomInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roomIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomText: {
    flex: 1,
    gap: 2,
  },
  roomNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  shareType: {
    fontSize: 11,
    fontWeight: '500',
  },
  summary: {
    flexDirection: 'row',
    gap: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  summaryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  summaryText: {
    fontSize: 12,
    fontWeight: '700',
  },
  bedsContainer: {
    gap: 6,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
});
