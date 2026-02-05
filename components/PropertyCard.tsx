import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Property } from '@/types/property';
import { useTheme } from '@/theme/useTheme';
import { Home, Building2, Bed, DoorOpen } from 'lucide-react-native';

interface PropertyCardProps {
  property: Property;
  onPress?: () => void;
}

export default function PropertyCard({ property, onPress }: PropertyCardProps) {
  const theme = useTheme();
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/property/${property.id}`);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.cardBorder },
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }]}>
          <Home size={24} color={theme.primary} strokeWidth={2} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.propertyName, { color: theme.text }]}>
            {property.name}
          </Text>
          <Text style={[styles.propertyType, { color: theme.textSecondary }]}>
            {property.type}
            {property.city ? ` • ${property.city}` : ''}
          </Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Building2 size={18} color={theme.textSecondary} strokeWidth={2} />
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Buildings
          </Text>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {property.buildings.length}
          </Text>
        </View>

        <View style={styles.statItem}>
          <DoorOpen size={18} color={theme.textSecondary} strokeWidth={2} />
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Rooms
          </Text>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {property.totalRooms}
          </Text>
        </View>

        <View style={styles.statItem}>
          <Bed size={18} color={theme.textSecondary} strokeWidth={2} />
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Beds
          </Text>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {property.totalBeds}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  propertyName: {
    fontSize: 18,
    fontWeight: '700',
  },
  propertyType: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
});
