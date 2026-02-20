import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Building,
  Home,
  Users,
  Bed,
  TrendingUp,
  DollarSign,
  UserPlus,
  CreditCard,
  AlertCircle,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Theme';
import { usePropertyStore } from '@/store/property';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { OccupancyChart } from '@/components/dashboard/OccupancyChart';
import { RecentTenants } from '@/components/dashboard/RecentTenants';
import { PropertyBreakdown } from '@/components/dashboard/PropertyBreakdown';
import { QuickActions } from '@/components/dashboard/QuickActions';
import {
  dashboardService,
  DashboardStats,
  PropertyStats,
} from '@/services/dashboardService';
import { TenantResponse } from '@/services/tenantService';


export default function DashboardScreen() {
  const router = useRouter();
  const { properties, isInitialized, initialize, getSelectedProperty } = usePropertyStore();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [propertyStats, setPropertyStats] = useState<PropertyStats[]>([]);
  const [recentTenants, setRecentTenants] = useState<TenantResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedProperty = getSelectedProperty();

  const loadDashboardData = async (isRefresh = false) => {
    if (!isRefresh) {
      setLoading(true);
    }
    setError(null);

    if (!selectedProperty) {
      setStats(null);
      setPropertyStats([]);
      setRecentTenants([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const [dashboardStats, propStats, tenants] = await Promise.all([
        dashboardService.getDashboardStats(selectedProperty.id),
        dashboardService.getPropertyStats(selectedProperty.id),
        dashboardService.getAllTenants(selectedProperty.id),
      ]);

      setStats(dashboardStats);
      setPropertyStats(propStats);
      setRecentTenants(tenants);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      loadDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, selectedProperty?.id]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData(true);
  };

  const quickActions = [
    {
      icon: UserPlus,
      label: 'Add Tenant',
      onPress: () => router.push('/(tabs)/members'),
      color: Colors.success,
    },
    {
      icon: Home,
      label: 'Add Room',
      onPress: () => router.push('/property/add-room'),
      color: Colors.primary,
    },
    {
      icon: Building,
      label: 'Add Property',
      onPress: () => router.push('/property/add-property'),
      color: Colors.info,
    },
    {
      icon: CreditCard,
      label: 'Payments',
      onPress: () => router.push('/(tabs)/payments'),
      color: Colors.warning,
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!isInitialized || loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={Colors.danger} strokeWidth={1.5} />
          <Text style={styles.errorTitle}>Failed to Load Dashboard</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadDashboardData()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (properties.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.emptyState}>
          <Building size={64} color={Colors.neutral[400]} strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>Welcome to TenantTracker</Text>
          <Text style={styles.emptyText}>
            Get started by adding your first property to begin managing tenants and tracking
            occupancy
          </Text>
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={() => router.push('/property/add-property')}>
            <Building size={20} color={Colors.background.paper} />
            <Text style={styles.getStartedButtonText}>Add Your First Property</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={Colors.primary}
        />
      }>
      <View style={styles.header}>
        <Text style={styles.greeting}>Dashboard</Text>
        <Text style={styles.subtitle}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>

      <View style={styles.metricsGrid}>
        <View style={styles.metricRow}>
          <View style={styles.metricItem}>
            <MetricCard
              title="Total Rooms"
              value={stats?.totalRooms || 0}
              icon={Home}
              iconColor={Colors.info}
              iconBgColor={Colors.info + '15'}
            />
          </View>
          <View style={styles.metricItem}>
            <MetricCard
              title="Total Beds"
              value={stats?.totalUnits || 0}
              icon={Bed}
              iconColor={Colors.secondary}
              iconBgColor={Colors.secondary + '15'}
              subtitle={`${stats?.availableUnits || 0} available`}
            />
          </View>
        </View>

        <View style={styles.metricRow}>
          <View style={styles.metricItem}>
            <MetricCard
              title="Occupancy"
              value={`${stats?.occupancyRate || 0}%`}
              icon={TrendingUp}
              iconColor={Colors.success}
              iconBgColor={Colors.success + '15'}
              subtitle={`${stats?.occupiedUnits || 0} occupied`}
            />
          </View>
          <View style={styles.metricItem}>
            <MetricCard
              title="Total Tenants"
              value={stats?.totalTenants || 0}
              icon={Users}
              iconColor={Colors.warning}
              iconBgColor={Colors.warning + '15'}
            />
          </View>
        </View>

        <View style={styles.metricRow}>
          <View style={styles.metricItem}>
            <MetricCard
              title="Revenue"
              value={formatCurrency(stats?.totalRevenue || 0)}
              icon={DollarSign}
              iconColor={Colors.success}
              iconBgColor={Colors.success + '15'}
              subtitle="Total deposits"
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <OccupancyChart
          occupied={stats?.occupiedUnits || 0}
          available={stats?.availableUnits || 0}
        />
      </View>

      {propertyStats.length > 0 && (
        <View style={styles.section}>
          <PropertyBreakdown properties={propertyStats} />
        </View>
      )}

      <View style={styles.section}>
        <RecentTenants
          tenants={recentTenants}
          onViewAll={() => router.push('/(tabs)/members')}
        />
      </View>

      <View style={styles.section}>
        <QuickActions actions={quickActions} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Last updated: {new Date().toLocaleTimeString()}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.default,
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: Fonts.size.base,
    color: Colors.text.secondary,
    fontWeight: Fonts.weight.medium,
    fontFamily: Fonts.family.medium,
  },
  errorContainer: {
    alignItems: 'center',
    maxWidth: 320,
    gap: 16,
  },
  errorTitle: {
    fontSize: Fonts.size.lg,
    fontWeight: Fonts.weight.semiBold,
    fontFamily: Fonts.family.semiBold,
    color: Colors.text.primary,
    marginTop: 8,
  },
  errorText: {
    fontSize: Fonts.size.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: Fonts.family.regular,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: Colors.background.paper,
    fontSize: Fonts.size.md,
    fontWeight: Fonts.weight.semiBold,
    fontFamily: Fonts.family.semiBold,
  },
  emptyState: {
    alignItems: 'center',
    maxWidth: 320,
    gap: 16,
  },
  emptyTitle: {
    fontSize: Fonts.size.xxl,
    fontWeight: Fonts.weight.bold,
    fontFamily: Fonts.family.bold,
    color: Colors.text.primary,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: Fonts.size.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: Fonts.family.regular,
  },
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
    marginTop: 8,
  },
  getStartedButtonText: {
    color: Colors.background.paper,
    fontSize: Fonts.size.md,
    fontWeight: Fonts.weight.semiBold,
    fontFamily: Fonts.family.semiBold,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: Fonts.size.xxxl,
    fontWeight: Fonts.weight.bold,
    fontFamily: Fonts.family.bold,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: Fonts.size.base,
    color: Colors.text.secondary,
    fontWeight: Fonts.weight.medium,
    fontFamily: Fonts.family.medium,
  },
  metricsGrid: {
    gap: 12,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricItem: {
    flex: 1,
  },
  section: {
    marginTop: 16,
  },
  footer: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    alignItems: 'center',
  },
  footerText: {
    fontSize: Fonts.size.sm,
    color: Colors.text.secondary,
    fontFamily: Fonts.family.regular,
  },
});
