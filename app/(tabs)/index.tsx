import { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { usePropertiesStore } from '@/store/usePropertiesStore';
import { useMembersStore } from '@/store/useMembersStore';
import StatCard from '@/components/StatCard';
import {
  Home,
  Building2,
  Layers,
  DoorOpen,
  Bed,
  Plus,
  ChevronRight,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function DashboardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { properties, activePropertyId, loadProperties, syncBedOccupancyWithMembers } =
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

  const activeProperty = useMemo(() => {
    return properties.find((property) => property.id === activePropertyId) ?? properties[0];
  }, [properties, activePropertyId]);

  const analytics = useMemo(() => {
    const activeProperties = activeProperty ? [activeProperty] : [];
    const totalProperties = activeProperties.length;
    const totalBuildings = activeProperties.reduce(
      (acc, property) => acc + property.buildings.length,
      0
    );
    const totalFloors = activeProperties.reduce(
      (acc, property) =>
        acc +
        property.buildings.reduce(
          (sum, building) => sum + building.floors.length,
          0
        ),
      0
    );
    const totalRooms = activeProperties.reduce(
      (acc, property) =>
        acc +
        property.buildings.reduce(
          (sum, building) =>
            sum +
            building.floors.reduce((fSum, floor) => fSum + floor.rooms.length, 0),
          0
        ),
      0
    );
    const totalBeds = activeProperties.reduce(
      (acc, property) =>
        acc +
        property.buildings.reduce(
          (sum, building) =>
            sum +
            building.floors.reduce(
              (fSum, floor) =>
                fSum +
                floor.rooms.reduce((rSum, room) => rSum + room.beds.length, 0),
              0
            ),
          0
        ),
      0
    );

    const occupiedBeds = activeProperties.reduce(
      (acc, property) =>
        acc +
        property.buildings.reduce(
          (sum, building) =>
            sum +
            building.floors.reduce(
              (fSum, floor) =>
                fSum +
                floor.rooms.reduce(
                  (rSum, room) =>
                    rSum + room.beds.filter((bed) => bed.occupied).length,
                  0
                ),
              0
            ),
          0
        ),
      0
    );

    const availableBeds = totalBeds - occupiedBeds;

    return {
      totalProperties,
      totalBuildings,
      totalFloors,
      totalRooms,
      totalBeds,
      availableBeds,
      activePropertyId: activeProperty?.id,
    };
  }, [activeProperty]);

  const handleCreateProperty = () => {
    router.push('/wizard/property-details');
  };

  if (properties.length === 0) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View style={styles.emptyContent}>
          <Animated.View
            entering={FadeInDown.springify()}
            style={[
              styles.emptyCard,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
            ]}
          >
            <View
              style={[
                styles.emptyIconContainer,
                { backgroundColor: theme.primary + '15' },
              ]}
            >
              <Home size={64} color={theme.primary} strokeWidth={2} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No Properties Yet
            </Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Create your first property to see analytics and insights
            </Text>
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: theme.accent }]}
              onPress={handleCreateProperty}
              activeOpacity={0.8}
            >
              <Plus size={20} color="#ffffff" strokeWidth={2} />
              <Text style={styles.createButtonText}>Create Property</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.content}>
        {/* Header Section */}
        <Animated.View 
          entering={FadeInDown.duration(400)}
          style={[styles.header, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => router.push('/properties')}
              activeOpacity={0.7}
              style={[styles.propertyButton, { borderColor: theme.cardBorder }]}
            >
              <View style={styles.propertyButtonContent}>
                <View>
                  <Text style={[styles.propertyLabel, { color: theme.textSecondary }]}>Property</Text>
                  <Text style={[styles.propertyName, { color: theme.text }]}>
                    {activeProperty?.name || 'No Property'}
                  </Text>
                </View>
                <ChevronRight size={20} color={theme.textSecondary} strokeWidth={2.5} />
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Main Stats Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Overview</Text>
          <View style={styles.statsGrid}>
            <TouchableOpacity
              style={styles.statCardWrap}
              onPress={() => router.push('/beds/total')}
              activeOpacity={0.7}
            >
              <StatCard
                icon={Bed}
                label="Beds"
                value={analytics.totalBeds}
                delay={0}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.statCardWrap}
              onPress={() =>
                router.push('/buildings')
              }
              activeOpacity={0.7}
            >
              <StatCard
                icon={Building2}
                label="Buildings"
                value={analytics.totalBuildings}
                delay={50}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.statCardWrap}
              onPress={() =>
                router.push('/floors')
              }
              activeOpacity={0.7}
            >
              <StatCard
                icon={Layers}
                label="Floors"
                value={analytics.totalFloors}
                delay={100}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.statCardWrap}
              onPress={() =>
                router.push('/rooms')
              }
              activeOpacity={0.7}
            >
              <StatCard
                icon={DoorOpen}
                label="Rooms"
                value={analytics.totalRooms}
                delay={150}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 112,
    gap: 12,
  },
  header: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  headerContent: {
    gap: 8,
  },
  propertyButton: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  propertyButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  propertyLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  propertyName: {
    fontSize: 15,
    fontWeight: '700',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCardWrap: {
    flexBasis: '48%',
    maxWidth: '48%',
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCard: {
    padding: 32,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    gap: 16,
    width: '100%',
    maxWidth: 400,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
