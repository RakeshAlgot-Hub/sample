import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { Building2, Layers, DoorOpen, Bed } from 'lucide-react-native';

interface TotalStatsCardProps {
  totalBuildings: number;
  totalFloors: number;
  totalRooms: number;
  totalBeds: number;
}

export default function TotalStatsCard({
  totalBuildings,
  totalFloors,
  totalRooms,
  totalBeds,
}: TotalStatsCardProps) {
  const theme = useTheme();
  const windowWidth = Dimensions.get('window').width;
  const isWideScreen = windowWidth > 768;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.card, borderColor: theme.cardBorder },
        isWideScreen && styles.containerWide,
      ]}
    >
      <Text style={[styles.title, { color: theme.text }]}>Summary</Text>
      <View style={[styles.grid, isWideScreen && styles.gridWide]}>
        <View style={[styles.statItem, isWideScreen && styles.statItemWide]}>
          <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }, isWideScreen && styles.iconContainerWide]}>
            <Building2 size={isWideScreen ? 24 : 20} color={theme.primary} strokeWidth={2} />
          </View>
          <Text style={[styles.statValue, { color: theme.text }, isWideScreen && styles.statValueWide]}>
            {totalBuildings}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }, isWideScreen && styles.statLabelWide]}>
            {totalBuildings === 1 ? 'Building' : 'Buildings'}
          </Text>
        </View>

        <View style={[styles.statItem, isWideScreen && styles.statItemWide]}>
          <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }, isWideScreen && styles.iconContainerWide]}>
            <Layers size={isWideScreen ? 24 : 20} color={theme.primary} strokeWidth={2} />
          </View>
          <Text style={[styles.statValue, { color: theme.text }, isWideScreen && styles.statValueWide]}>
            {totalFloors}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }, isWideScreen && styles.statLabelWide]}>
            {totalFloors === 1 ? 'Floor' : 'Floors'}
          </Text>
        </View>

        <View style={[styles.statItem, isWideScreen && styles.statItemWide]}>
          <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }, isWideScreen && styles.iconContainerWide]}>
            <DoorOpen size={isWideScreen ? 24 : 20} color={theme.primary} strokeWidth={2} />
          </View>
          <Text style={[styles.statValue, { color: theme.text }, isWideScreen && styles.statValueWide]}>
            {totalRooms}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }, isWideScreen && styles.statLabelWide]}>
            {totalRooms === 1 ? 'Room' : 'Rooms'}
          </Text>
        </View>

        <View style={[styles.statItem, isWideScreen && styles.statItemWide]}>
          <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }, isWideScreen && styles.iconContainerWide]}>
            <Bed size={isWideScreen ? 24 : 20} color={theme.primary} strokeWidth={2} />
          </View>
          <Text style={[styles.statValue, { color: theme.text }, isWideScreen && styles.statValueWide]}>
            {totalBeds}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }, isWideScreen && styles.statLabelWide]}>
            {totalBeds === 1 ? 'Bed' : 'Beds'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 16,
  },
  containerWide: {
    padding: 28,
    gap: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  gridWide: {
    gap: 24,
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
    width: '45%',
  },
  statItemWide: {
    width: '22%',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerWide: {
    width: 56,
    height: 56,
    borderRadius: 14,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  statValueWide: {
    fontSize: 32,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  statLabelWide: {
    fontSize: 14,
    fontWeight: '600',
  },
});
