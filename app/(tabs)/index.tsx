import { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { useStore } from '@/store/useStore';
import { usePropertiesStore } from '@/store/usePropertiesStore';
import { useMembersStore } from '@/store/useMembersStore';
import StatCard from '@/components/StatCard';
import OccupancyIndicator from '@/components/OccupancyIndicator';
import {
  Home,
  Building2,
  Layers,
  DoorOpen,
  Bed,
  Plus,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function DashboardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const user = useStore((state) => state.user);
  const { properties, loadProperties, syncBedOccupancyWithMembers } =
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

  const analytics = useMemo(() => {
    const totalProperties = properties.length;
    const totalBuildings = properties.reduce(
      (acc, property) => acc + property.buildings.length,
      0
    );
    const totalFloors = properties.reduce(
      (acc, property) =>
        acc +
        property.buildings.reduce(
          (sum, building) => sum + building.floors.length,
          0
        ),
      0
    );
    const totalRooms = properties.reduce(
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
    const totalBeds = properties.reduce(
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

    const occupiedBeds = properties.reduce(
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
    const occupancyRate = totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0;

    return {
      totalProperties,
      totalBuildings,
      totalFloors,
      totalRooms,
      totalBeds,
      occupiedBeds,
      availableBeds,
      occupancyRate,
    };
  }, [properties]);

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
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInDown.delay(0).springify()} style={styles.header}>
          <Text style={[styles.greeting, { color: theme.text }]}>
            Hello, {user?.name}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Your property overview
          </Text>
        </Animated.View>

        <View style={styles.section}>
          <Animated.Text
            entering={FadeInDown.delay(100).springify()}
            style={[styles.sectionTitle, { color: theme.text }]}
          >
            Overview
          </Animated.Text>
          <View style={styles.statsGrid}>
            <StatCard
              icon={Home}
              label="Properties"
              value={analytics.totalProperties}
              delay={150}
            />
            <StatCard
              icon={Building2}
              label="Buildings"
              value={analytics.totalBuildings}
              delay={200}
            />
            <StatCard
              icon={Layers}
              label="Floors"
              value={analytics.totalFloors}
              delay={250}
            />
            <StatCard
              icon={DoorOpen}
              label="Rooms"
              value={analytics.totalRooms}
              delay={300}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Animated.Text
            entering={FadeInDown.delay(350).springify()}
            style={[styles.sectionTitle, { color: theme.text }]}
          >
            Bed Occupancy
          </Animated.Text>
          <View style={styles.bedsGrid}>
            <StatCard
              icon={Bed}
              label="Total Beds"
              value={analytics.totalBeds}
              delay={400}
            />
            <StatCard
              icon={Bed}
              label="Available Beds"
              value={analytics.availableBeds}
              delay={450}
            />
          </View>
        </View>

        <View style={styles.section}>
          <OccupancyIndicator
            occupancyRate={analytics.occupancyRate}
            occupiedBeds={analytics.occupiedBeds}
            totalBeds={analytics.totalBeds}
            delay={500}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 32,
  },
  header: {
    gap: 4,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  bedsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCard: {
    padding: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    gap: 20,
    maxWidth: 400,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 28,
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
