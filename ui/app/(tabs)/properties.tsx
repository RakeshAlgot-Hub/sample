import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import ScreenContainer from '@/components/ScreenContainer';
import Card from '@/components/Card';
import EmptyState from '@/components/EmptyState';
import Skeleton from '@/components/Skeleton';
import ApiErrorCard from '@/components/ApiErrorCard';
import FAB from '@/components/FAB';
import LimitBanner from '@/components/LimitBanner';
import UpgradeNudge from '@/components/UpgradeNudge';
import UpgradeModal from '@/components/UpgradeModal';
import { Plus, MapPin, Bed, Users, Building2 } from 'lucide-react-native';
import { spacing, typography, radius, shadows } from '@/theme';
import { planConfig, isLimitReached } from '@/config/planConfig';
import { useTheme } from '@/context/ThemeContext';
import { propertyService } from '@/services/apiClient';
import type { Property } from '@/services/apiTypes';

export default function PropertiesScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const limitReached = isLimitReached('properties');

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await propertyService.getProperties();

      if (response.data) {
        setProperties(response.data);
        setTotal(response.meta?.total || 0);
        setHasMore(response.meta?.hasMore || false);
      }
    } catch (err: any) {
      if (err?.code === 'upgrade_required') {
        setShowUpgradeModal(true);
      } else {
        setError(err?.message || 'Failed to load properties');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleRetry = () => {
    fetchProperties();
  };

  const handleFabPress = () => {
    if (limitReached) {
      setShowUpgradeModal(true);
    } else {
      // FAB action placeholder
    }
  };

  const showEmptyState = !loading && properties.length === 0 && !error;

  return (
    <ScreenContainer edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Properties</Text>
        <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary[500] }]} activeOpacity={0.7}>
          <Plus size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      {limitReached && (
        <LimitBanner
          message="You've reached your property limit. Upgrade to add more."
          onUpgrade={() => setShowUpgradeModal(true)}
        />
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {loading ? (
          <Skeleton height={200} count={3} />
        ) : error ? (
          <ApiErrorCard error={error} onRetry={handleRetry} />
        ) : showEmptyState ? (
          <EmptyState
            icon={Building2}
            title="No Properties Yet"
            subtitle="Add your first property to start managing tenants and payments"
            actionLabel="Add Property"
            onActionPress={handleFabPress}
          />
        ) : (
          <>
            {properties.map((property, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => router.push('/property-detail')}
                activeOpacity={0.7}>
                <Card style={styles.propertyCard}>
                  <Text style={[styles.propertyName, { color: colors.text.primary }]}>
                    {property.name}
                  </Text>
                  <View style={styles.addressRow}>
                    <MapPin size={16} color={colors.text.secondary} />
                    <Text style={[styles.addressText, { color: colors.text.secondary }]}>
                      {property.address}
                    </Text>
                  </View>

                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Bed size={18} color={colors.primary[500]} />
                      <Text style={[styles.statText, { color: colors.text.primary }]}>
                        {property.occupiedBeds}/{property.totalBeds} Beds
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Users size={18} color={colors.success[500]} />
                      <Text style={[styles.statText, { color: colors.text.primary }]}>
                        {property.occupiedBeds} Tenants
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.occupancyBar, { backgroundColor: colors.neutral[200] }]}>
                    <View
                      style={[
                        styles.occupancyFill,
                        {
                          width: `${property.occupancy}%`,
                          backgroundColor: colors.success[500],
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.occupancyText, { color: colors.success[600] }]}>
                    {property.occupancy}% Occupancy
                  </Text>
                </Card>
              </TouchableOpacity>
            ))}

            {planConfig.currentPlan === 'free' && (
              <UpgradeNudge message="Upgrade to Pro to manage up to 10 properties with advanced features" />
            )}
          </>
        )}
      </ScrollView>
      <FAB onPress={handleFabPress} />
      <UpgradeModal
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSelectPlan={() => setShowUpgradeModal(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  propertyCard: {
    marginBottom: spacing.md,
  },
  propertyName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  addressText: {
    fontSize: typography.fontSize.sm,
    marginLeft: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.xl,
  },
  statText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    marginLeft: spacing.sm,
  },
  occupancyBar: {
    height: 8,
    borderRadius: radius.sm,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  occupancyFill: {
    height: '100%',
    borderRadius: radius.sm,
  },
  occupancyText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'right',
  },
});
