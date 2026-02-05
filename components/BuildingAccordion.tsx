import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Building } from '@/types/property';
import { useTheme } from '@/theme/useTheme';
import { Building2, ChevronDown, ChevronRight } from 'lucide-react-native';
import FloorAccordion from './FloorAccordion';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';

interface BuildingAccordionProps {
  building: Building;
}

export default function BuildingAccordion({ building }: BuildingAccordionProps) {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const totalRooms = building.floors.reduce(
    (acc, floor) => acc + floor.rooms.length,
    0
  );
  const totalBeds = building.floors.reduce(
    (acc, floor) =>
      acc + floor.rooms.reduce((sum, room) => sum + room.beds.length, 0),
    0
  );
  const occupiedBeds = building.floors.reduce(
    (acc, floor) =>
      acc +
      floor.rooms.reduce(
        (sum, room) => sum + room.beds.filter((bed) => bed.occupied).length,
        0
      ),
    0
  );
  const availableBeds = totalBeds - occupiedBeds;

  return (
    <Animated.View
      entering={FadeIn}
      layout={Layout.springify()}
      style={[
        styles.container,
        { backgroundColor: theme.card, borderColor: theme.cardBorder },
      ]}
    >
      <TouchableOpacity
        style={styles.header}
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
          <ChevronDown size={20} color={theme.textSecondary} strokeWidth={2} />
        ) : (
          <ChevronRight size={20} color={theme.textSecondary} strokeWidth={2} />
        )}
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.floorsContainer}>
          {building.floors.map((floor) => (
            <FloorAccordion key={floor.id} floor={floor} />
          ))}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
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
    fontSize: 14,
    fontWeight: '700',
  },
  floorsContainer: {
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
