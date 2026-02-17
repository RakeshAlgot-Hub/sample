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
import type { PropertySummary } from '@/types/property';
// import { useMembersStore } from '@/store/useMembersStore';
import {
  Home,
  Users,
  Plus,
  ChevronRight,
  DoorOpen,
  Layers,
  Building2,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';






export default function DashboardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { properties, activePropertyId, loadProperties } = usePropertiesStore();
  // const { members, loadMembers } = useMembersStore();

  useEffect(() => {
    const initializeData = async () => {
      await loadProperties();
      // No need to load all members globally
    };
    initializeData();
  }, []);

  const activeProperty = useMemo(() => {
    return properties.find((property) => property.id === activePropertyId) ?? properties[0];
  }, [properties, activePropertyId]);

  const analytics = useMemo(() => {
    if (!activeProperty) {
      return {
        totalProperties: 0,
        totalBuildings: 0,
        totalFloors: 0,
        totalRooms: 0,
        totalBeds: 0,
        occupiedBeds: 0,
        availableBeds: 0,
        activePropertyId: undefined,
      };
    }
    return {
      totalProperties: 1,
      totalBuildings: activeProperty.totalBuildings,
      totalFloors: activeProperty.totalFloors,
      totalRooms: activeProperty.totalRooms,
      totalBeds: activeProperty.totalBeds,
      occupiedBeds: activeProperty.occupiedBeds,
      availableBeds: activeProperty.availableBeds,
      activePropertyId: activeProperty.id,
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
      <View
        style={[styles.backgroundAccent, { backgroundColor: theme.primary + '0D' }]}
        pointerEvents="none"
      />
      <View
        style={[styles.backgroundAccentAlt, { backgroundColor: theme.accent + '0A' }]}
        pointerEvents="none"
      />
      <View style={styles.content}>
        {/* Header Section */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={[styles.heroCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
        >
          <View style={styles.heroHeader}>
            <Text style={[styles.heroTitle, { color: theme.text }]}>Dashboard</Text>
            <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>Overview</Text>
          </View>
              {/* Removed property-details navigation. Properties are now accessible via bottom bar. */}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(450).delay(60)}>
          <View
            style={[
              styles.bedsSummaryCard,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
            ]}
          >
            <View style={styles.bedsSummaryRow}>
              <View style={styles.bedsSummaryItem}>
                <Text style={[styles.bedsSummaryLabel, { color: theme.textSecondary }]}>Total Beds</Text>
                <Text style={[styles.bedsSummaryValue, { color: theme.text }]}>{analytics.totalBeds}</Text>
              </View>
              <View style={[styles.bedsSummaryDivider, { backgroundColor: theme.cardBorder }]} />
              <View style={styles.bedsSummaryItem}>
                <Text style={[styles.bedsSummaryLabel, { color: theme.textSecondary }]}>Available Beds</Text>
                <Text style={[styles.bedsSummaryValue, { color: theme.text }]}>{analytics.availableBeds}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Overview Section */}
        <Animated.View entering={FadeInDown.duration(450).delay(120)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Overview</Text>
          <View style={styles.overviewGrid}>
            {/* Members overview removed: member totals are not available in summary */}
            <View style={styles.overviewItem}>
              <View
                style={[
                  styles.overviewBox,
                  { backgroundColor: theme.card, borderColor: theme.cardBorder },
                ]}
              >
                <View style={styles.overviewHeader}>
                  <View
                    style={[
                      styles.overviewIcon,
                      { backgroundColor: theme.primary + '15' },
                    ]}
                  >
                    <DoorOpen size={18} color={theme.primary} strokeWidth={2.2} />
                  </View>
                  <Text style={[styles.overviewLabel, { color: theme.textSecondary }]}>Rooms</Text>
                </View>
                <Text style={[styles.overviewValue, { color: theme.text }]}>
                  {analytics.totalRooms}
                </Text>
              </View>
            </View>
            <View style={styles.overviewItem}>
              <View
                style={[
                  styles.overviewBox,
                  { backgroundColor: theme.card, borderColor: theme.cardBorder },
                ]}
              >
                <View style={styles.overviewHeader}>
                  <View
                    style={[
                      styles.overviewIcon,
                      { backgroundColor: theme.primary + '15' },
                    ]}
                  >
                    <Layers size={18} color={theme.primary} strokeWidth={2.2} />
                  </View>
                  <Text style={[styles.overviewLabel, { color: theme.textSecondary }]}>Floors</Text>
                </View>
                <Text style={[styles.overviewValue, { color: theme.text }]}>
                  {analytics.totalFloors}
                </Text>
              </View>
            </View>
            <View style={styles.overviewItem}>
              <View
                style={[
                  styles.overviewBox,
                  { backgroundColor: theme.card, borderColor: theme.cardBorder },
                ]}
              >
                <View style={styles.overviewHeader}>
                  <View
                    style={[
                      styles.overviewIcon,
                      { backgroundColor: theme.primary + '15' },
                    ]}
                  >
                    <Building2 size={18} color={theme.primary} strokeWidth={2.2} />
                  </View>
                  <Text style={[styles.overviewLabel, { color: theme.textSecondary }]}>Buildings</Text>
                </View>
                <Text style={[styles.overviewValue, { color: theme.text }]}>
                  {analytics.totalBuildings}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
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
    paddingTop: 16,
    paddingBottom: 112,
    gap: 16,
  },
  backgroundAccent: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
  },
  backgroundAccentAlt: {
    position: 'absolute',
    top: 140,
    left: -90,
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  heroCard: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  heroHeader: {
    gap: 4,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  heroSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  propertyButton: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
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
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  propertyName: {
    fontSize: 16,
    fontWeight: '700',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  bedsSummaryCard: {
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  bedsSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bedsSummaryItem: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 8,
  },
  bedsSummaryDivider: {
    width: 1,
    height: 48,
  },
  bedsSummaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  bedsSummaryValue: {
    fontSize: 26,
    fontWeight: '800',
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  overviewItem: {
    flexBasis: '48%',
    maxWidth: '48%',
  },
  overviewLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  overviewBox: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  overviewIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: 26,
    fontWeight: '800',
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
