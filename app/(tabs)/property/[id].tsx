import { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { usePropertiesStore } from '@/store/usePropertiesStore';
import { useMembersStore } from '@/store/useMembersStore';
import BuildingAccordion from '@/components/BuildingAccordion';
import { Home, MapPin, ChevronLeft, Building2, Bed, Pencil, Trash2 } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function PropertyDetailsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { properties, loadProperties, syncBedOccupancyWithMembers, removeProperty } =
    usePropertiesStore();
  const { members, loadMembers } = useMembersStore();

  useEffect(() => {
    const initializeData = async () => {
      await loadProperties();
      await loadMembers();
      await syncBedOccupancyWithMembers(members);
    };
    initializeData();
  }, []);

  const property = useMemo(
    () => properties.find((p) => p.id === id),
    [properties, id]
  );

  const assignedMembers = useMemo(
    () => members.filter((member) => member.propertyId === id),
    [members, id]
  );

  if (!property) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: theme.inputBackground }]}
            activeOpacity={0.7}
          >
            <ChevronLeft size={24} color={theme.text} strokeWidth={2} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContent}>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Property not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalBeds = property.buildings.reduce(
    (acc, building) =>
      acc +
      building.floors.reduce(
        (sum, floor) =>
          sum + floor.rooms.reduce((bedSum, room) => bedSum + room.beds.length, 0),
        0
      ),
    0
  );

  const occupiedBeds = property.buildings.reduce(
    (acc, building) =>
      acc +
      building.floors.reduce(
        (sum, floor) =>
          sum +
          floor.rooms.reduce(
            (bedSum, room) =>
              bedSum + room.beds.filter((bed) => bed.occupied).length,
            0
          ),
        0
      ),
    0
  );

  const availableBeds = totalBeds - occupiedBeds;

  const handleEdit = () => {
    if (!property) return;
    router.push(`/property/edit/${property.id}`);
  };

  const handleDelete = () => {
    if (!property) return;
    const memberCount = assignedMembers.length;
    const memberNote = memberCount > 0
      ? `\n\n${memberCount} member(s) are assigned to this property.`
      : '';

    Alert.alert(
      'Delete Property',
      `Are you sure you want to delete "${property.name}"? This action cannot be undone.${memberNote}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await removeProperty(property.id);
            router.replace('/(tabs)/properties');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: theme.inputBackground }]}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={theme.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Property Details
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View
          entering={FadeInDown.delay(0).springify()}
          style={[
            styles.propertyCard,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
          ]}
        >
          <View style={styles.propertyHeader}>
            <View style={[styles.propertyIcon, { backgroundColor: theme.primary + '15' }]}>
              <Home size={32} color={theme.primary} strokeWidth={2} />
            </View>
            <View style={styles.propertyInfo}>
              <Text style={[styles.propertyName, { color: theme.text }]}>
                {property.name}
              </Text>
              <Text style={[styles.propertyType, { color: theme.textSecondary }]}>
                {property.type}
              </Text>
            </View>
          </View>

          {property.city && (
            <View style={styles.cityRow}>
              <MapPin size={16} color={theme.textSecondary} strokeWidth={2} />
              <Text style={[styles.cityText, { color: theme.textSecondary }]}>
                {property.city}
              </Text>
            </View>
          )}

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Building2 size={20} color={theme.textSecondary} strokeWidth={2} />
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Buildings
              </Text>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {property.buildings.length}
              </Text>
            </View>

            <View style={styles.statItem}>
              <Bed size={20} color={theme.success} strokeWidth={2} />
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Available
              </Text>
              <Text style={[styles.statValue, { color: theme.success }]}>
                {availableBeds}
              </Text>
            </View>

            <View style={styles.statItem}>
              <Bed size={20} color={theme.error} strokeWidth={2} />
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Occupied
              </Text>
              <Text style={[styles.statValue, { color: theme.error }]}>
                {occupiedBeds}
              </Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.primary }]}
            onPress={handleEdit}
            activeOpacity={0.8}
          >
            <Pencil size={18} color="#ffffff" strokeWidth={2} />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.error }]}
            onPress={handleDelete}
            activeOpacity={0.8}
          >
            <Trash2 size={18} color="#ffffff" strokeWidth={2} />
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Animated.Text
            entering={FadeInDown.delay(100).springify()}
            style={[styles.sectionTitle, { color: theme.text }]}
          >
            Property Hierarchy
          </Animated.Text>
          <View style={styles.buildingsList}>
            {property.buildings.map((building, index) => (
              <Animated.View
                key={building.id}
                entering={FadeInDown.delay(150 + index * 50).springify()}
              >
                <BuildingAccordion building={building} />
              </Animated.View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  placeholder: {
    width: 44,
  },
  content: {
    padding: 20,
    gap: 24,
  },
  propertyCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
  },
  propertyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  propertyIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  propertyInfo: {
    flex: 1,
    gap: 4,
  },
  propertyName: {
    fontSize: 24,
    fontWeight: '700',
  },
  propertyType: {
    fontSize: 16,
    fontWeight: '600',
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cityText: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  statItem: {
    alignItems: 'center',
    gap: 6,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  buildingsList: {
    gap: 16,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});
