import { View, Text, StyleSheet } from 'react-native';
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

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.card, borderColor: theme.cardBorder },
      ]}
    >
      <Text style={[styles.title, { color: theme.text }]}>Summary</Text>
      <View style={styles.grid}>
        <View style={styles.statItem}>
          <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }]}>
            <Building2 size={20} color={theme.primary} strokeWidth={2} />
          </View>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {totalBuildings}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            {totalBuildings === 1 ? 'Building' : 'Buildings'}
          </Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }]}>
            <Layers size={20} color={theme.primary} strokeWidth={2} />
          </View>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {totalFloors}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            {totalFloors === 1 ? 'Floor' : 'Floors'}
          </Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }]}>
            <DoorOpen size={20} color={theme.primary} strokeWidth={2} />
          </View>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {totalRooms}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            {totalRooms === 1 ? 'Room' : 'Rooms'}
          </Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }]}>
            <Bed size={20} color={theme.primary} strokeWidth={2} />
          </View>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {totalBeds}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
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
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
    width: '45%',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
});
