import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { Building, Floor, Room } from '@/types/property';
import { Building2, Layers, DoorOpen, Bed, ChevronDown, ChevronRight } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';

interface HierarchyCardProps {
  building: Building;
}

export default function HierarchyCard({ building }: HierarchyCardProps) {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const totalRooms = building.floors.reduce((acc, floor) => acc + floor.rooms.length, 0);
  const totalBeds = building.floors.reduce(
    (acc, floor) =>
      acc + floor.rooms.reduce((sum, room) => sum + room.beds.length, 0),
    0
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.card, borderColor: theme.cardBorder },
      ]}
    >
      <TouchableOpacity
        style={styles.buildingHeader}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.buildingInfo}>
          <View style={[styles.buildingIcon, { backgroundColor: theme.primary + '15' }]}>
            <Building2 size={20} color={theme.primary} strokeWidth={2} />
          </View>
          <View style={styles.buildingText}>
            <Text style={[styles.buildingName, { color: theme.text }]}>
              {building.name}
            </Text>
            <Text style={[styles.buildingStats, { color: theme.textSecondary }]}>
              {building.floors.length} {building.floors.length === 1 ? 'Floor' : 'Floors'} • {totalRooms} {totalRooms === 1 ? 'Room' : 'Rooms'} • {totalBeds} {totalBeds === 1 ? 'Bed' : 'Beds'}
            </Text>
          </View>
        </View>
        {isExpanded ? (
          <ChevronDown size={20} color={theme.textSecondary} strokeWidth={2} />
        ) : (
          <ChevronRight size={20} color={theme.textSecondary} strokeWidth={2} />
        )}
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.floorsContainer}>
          {building.floors.map((floor) => (
            <FloorItem key={floor.id} floor={floor} />
          ))}
        </View>
      )}
    </View>
  );
}

function FloorItem({ floor }: { floor: Floor }) {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const totalBeds = floor.rooms.reduce((sum, room) => sum + room.beds.length, 0);

  return (
    <View
      style={[
        styles.floorContainer,
        { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder },
      ]}
    >
      <TouchableOpacity
        style={styles.floorHeader}
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
        {isExpanded ? (
          <ChevronDown size={18} color={theme.textSecondary} strokeWidth={2} />
        ) : (
          <ChevronRight size={18} color={theme.textSecondary} strokeWidth={2} />
        )}
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.roomsContainer}>
          {floor.rooms.map((room) => (
            <RoomItem key={room.id} room={room} />
          ))}
        </View>
      )}
    </View>
  );
}

function RoomItem({ room }: { room: Room }) {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

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

  return (
    <View
      style={[
        styles.roomContainer,
        { backgroundColor: theme.background, borderColor: theme.border },
      ]}
    >
      <TouchableOpacity
        style={styles.roomHeader}
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
            <Text style={[styles.roomStats, { color: theme.textSecondary }]}>
              {getRoomLabel(room)} • {room.beds.length} {room.beds.length === 1 ? 'Bed' : 'Beds'}
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
            <View key={bed.id} style={styles.bedItem}>
              <Bed size={14} color={theme.textSecondary} strokeWidth={2} />
              <Text style={[styles.bedText, { color: theme.textSecondary }]}>
                Bed {bed.id}
              </Text>
              <View
                style={[
                  styles.bedStatus,
                  {
                    backgroundColor: bed.occupied ? theme.accent + '15' : theme.success + '15',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.bedStatusText,
                    { color: bed.occupied ? theme.accent : theme.success },
                  ]}
                >
                  {bed.occupied ? 'Occupied' : 'Available'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  buildingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  buildingInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  buildingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buildingText: {
    flex: 1,
    gap: 4,
  },
  buildingName: {
    fontSize: 16,
    fontWeight: '700',
  },
  buildingStats: {
    fontSize: 13,
    fontWeight: '500',
  },
  floorsContainer: {
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  floorContainer: {
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  floorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
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
  roomsContainer: {
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  roomContainer: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
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
  roomStats: {
    fontSize: 11,
    fontWeight: '500',
  },
  bedsContainer: {
    gap: 6,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  bedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  bedText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  bedStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  bedStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
