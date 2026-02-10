import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Floor } from '@/types/property';
import { useTheme } from '@/theme/useTheme';
import { Layers, ChevronDown, ChevronRight } from 'lucide-react-native';
import RoomDetailCard from './RoomDetailCard';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';

interface FloorAccordionProps {
  floor: Floor;
}

export default function FloorAccordion({ floor }: FloorAccordionProps) {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const totalBeds = floor.rooms.reduce(
    (sum, room) => sum + room.beds.length,
    0
  );
  const occupiedBeds = floor.rooms.reduce(
    (sum, room) => sum + room.beds.filter((bed) => bed.occupied).length,
    0
  );
  const availableBeds = totalBeds - occupiedBeds;

  return (
    <Animated.View
      entering={FadeIn}
      layout={Layout.springify()}
      style={[
        styles.container,
        { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder },
      ]}
    >
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.floorInfo}>
          <View style={[styles.floorIcon, { backgroundColor: theme.primary + '15' }]}>
            <Layers size={16} color={theme.primary} strokeWidth={2} />
          </View>
          <View style={styles.floorText}>
            <Text style={[styles.floorLabel, { color: theme.text }]}>
              Floor {floor.label}
            </Text>
            <Text style={[styles.floorStats, { color: theme.textSecondary }]}>
              {floor.rooms.length} {floor.rooms.length === 1 ? 'Room' : 'Rooms'} • {totalBeds} {totalBeds === 1 ? 'Bed' : 'Beds'}
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
          <ChevronDown size={18} color={theme.textSecondary} strokeWidth={2} />
        ) : (
          <ChevronRight size={18} color={theme.textSecondary} strokeWidth={2} />
        )}
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.roomsContainer}>
          {floor.rooms.map((room) => (
            <RoomDetailCard key={room.id} room={room} />
          ))}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
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
  floorInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  floorIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floorText: {
    flex: 1,
    gap: 2,
  },
  floorLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  floorStats: {
    fontSize: 12,
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
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  summaryText: {
    fontSize: 13,
    fontWeight: '700',
  },
  roomsContainer: {
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
});
