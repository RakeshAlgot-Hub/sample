import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import ScreenContainer from '@/components/ScreenContainer';
import SectionHeader from '@/components/SectionHeader';
import Card from '@/components/Card';
import FAB from '@/components/FAB';
import SubscriptionSummaryCard from '@/components/SubscriptionSummaryCard';
import Skeleton from '@/components/Skeleton';
import ApiErrorCard from '@/components/ApiErrorCard';
import UpgradeModal from '@/components/UpgradeModal';
import {
  Building2,
  Users,
  Bed,
  TrendingUp,
  AlertCircle,
  Clock,
} from 'lucide-react-native';
import { spacing, typography, radius } from '@/theme';
import { useTheme } from '@/context/ThemeContext';
import {
  propertyService,
  tenantService,
  paymentService,
  subscriptionService,
} from '@/services/apiClient';
import type { Property, Tenant, Payment, Subscription } from '@/services/apiTypes';

interface DashboardData {
  properties: Property[];
  tenants: Tenant[];
  payments: Payment[];
  subscription: Subscription | null;
  totalBeds: number;
  occupancyRate: number;
  duePayments: Payment[];
  overduePayments: Payment[];
}

export default function DashboardScreen() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [propertiesRes, tenantsRes, paymentsRes, subscriptionRes] = await Promise.all([
        propertyService.getProperties(),
        tenantService.getTenants(),
        paymentService.getPayments(),
        subscriptionService.getSubscription(),
      ]);

      const properties = propertiesRes.data || [];
      const tenants = tenantsRes.data || [];
      const payments = paymentsRes.data || [];
      const subscription = subscriptionRes.data || null;

      const totalBeds = properties.reduce((sum, p) => sum + p.totalBeds, 0);
      const occupiedBeds = properties.reduce((sum, p) => sum + p.occupiedBeds, 0);
      const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

      const duePayments = payments.filter((p) => p.status === 'due');
      const overduePayments = payments.filter((p) => p.status === 'overdue');

      setDashboardData({
        properties,
        tenants,
        payments,
        subscription,
        totalBeds,
        occupancyRate,
        duePayments,
        overduePayments,
      });
    } catch (err: any) {
      if (err?.code === 'upgrade_required') {
        setShowUpgradeModal(true);
      } else {
        setError(err?.message || 'Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRetry = () => {
    fetchDashboardData();
  };

  const handleFabPress = () => {
    // FAB action placeholder
  };

  const stats = dashboardData
    ? [
        {
          icon: Building2,
          label: 'Properties',
          value: String(dashboardData.properties.length),
          color: colors.primary[500],
        },
        {
          icon: Bed,
          label: 'Total Beds',
          value: String(dashboardData.totalBeds),
          color: colors.purple[500],
        },
        {
          icon: Users,
          label: 'Tenants',
          value: String(dashboardData.tenants.length),
          color: colors.success[500],
        },
        {
          icon: TrendingUp,
          label: 'Occupancy',
          value: `${dashboardData.occupancyRate}%`,
          color: colors.warning[500],
        },
      ]
    : [];

  return (
    <ScreenContainer edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {loading ? (
          <>
            <View style={styles.header}>
              <Text style={[styles.greeting, { color: colors.text.secondary }]}>Welcome back,</Text>
              <Text style={[styles.ownerName, { color: colors.text.primary }]}>Property Owner</Text>
            </View>
            <Skeleton height={120} count={2} />
          </>
        ) : error ? (
          <>
            <View style={styles.header}>
              <Text style={[styles.greeting, { color: colors.text.secondary }]}>Welcome back,</Text>
              <Text style={[styles.ownerName, { color: colors.text.primary }]}>Property Owner</Text>
            </View>
            <ApiErrorCard error={error} onRetry={handleRetry} />
          </>
        ) : (
          <>
            <View style={styles.header}>
              <Text style={[styles.greeting, { color: colors.text.secondary }]}>Welcome back,</Text>
              <Text style={[styles.ownerName, { color: colors.text.primary }]}>Property Owner</Text>
            </View>

            <View style={styles.statsGrid}>
              {stats.map((stat, index) => (
                <Card key={index} style={styles.statCard}>
                  <View style={[styles.iconContainer, { backgroundColor: stat.color }]}>
                    <stat.icon size={20} color={colors.white} />
                  </View>
                  <Text style={[styles.statValue, { color: colors.text.primary }]}>{stat.value}</Text>
                  <Text style={[styles.statLabel, { color: colors.text.secondary }]}>{stat.label}</Text>
                </Card>
              ))}
            </View>

            <SubscriptionSummaryCard />

            {dashboardData && dashboardData.duePayments.length > 0 && (
              <View style={styles.section}>
                <SectionHeader icon={Clock} iconColor={colors.primary[500]} title="Due Soon" />
                {dashboardData.duePayments.map((payment, index) => (
                  <Card key={index} style={styles.paymentCard}>
                    <View style={styles.paymentRow}>
                      <View style={styles.paymentInfo}>
                        <Text style={[styles.paymentName, { color: colors.text.primary }]}>
                          {payment.tenantName}
                        </Text>
                        <Text style={[styles.paymentRoom, { color: colors.text.secondary }]}>
                          Room {payment.bed}
                        </Text>
                      </View>
                      <View style={styles.paymentRight}>
                        <Text style={[styles.paymentAmount, { color: colors.text.primary }]}>
                          {payment.amount}
                        </Text>
                        <Text style={[styles.paymentDate, { color: colors.primary[500] }]}>
                          {payment.dueDate}
                        </Text>
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            )}

            {dashboardData && dashboardData.overduePayments.length > 0 && (
              <View style={styles.section}>
                <SectionHeader icon={AlertCircle} iconColor={colors.danger[500]} title="Overdue" />
                {dashboardData.overduePayments.map((payment, index) => {
                  const dueDate = new Date(payment.dueDate);
                  const today = new Date();
                  const diffTime = Math.abs(today.getTime() - dueDate.getTime());
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                  return (
                    <Card key={index} style={styles.paymentCard}>
                      <View style={styles.paymentRow}>
                        <View style={styles.paymentInfo}>
                          <Text style={[styles.paymentName, { color: colors.text.primary }]}>
                            {payment.tenantName}
                          </Text>
                          <Text style={[styles.paymentRoom, { color: colors.text.secondary }]}>
                            Room {payment.bed}
                          </Text>
                        </View>
                        <View style={styles.paymentRight}>
                          <Text style={[styles.paymentAmount, { color: colors.text.primary }]}>
                            {payment.amount}
                          </Text>
                          <View style={[styles.overdueTag, { backgroundColor: colors.danger[100] }]}>
                            <Text style={[styles.overdueText, { color: colors.danger[700] }]}>
                              {diffDays} {diffDays === 1 ? 'day' : 'days'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </Card>
                  );
                })}
              </View>
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
    paddingVertical: spacing.xl,
  },
  greeting: {
    fontSize: typography.fontSize.md,
    marginBottom: spacing.xs,
  },
  ownerName: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
    marginBottom: spacing.xl,
  },
  statCard: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: spacing.sm,
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  statValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
  },
  section: {
    marginBottom: spacing.xl,
  },
  paymentCard: {
    marginBottom: spacing.sm,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  paymentRoom: {
    fontSize: typography.fontSize.sm,
  },
  paymentRight: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  paymentDate: {
    fontSize: typography.fontSize.sm,
  },
  overdueTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  overdueText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
});
