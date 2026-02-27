import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import Card from '@/components/Card';
import { Crown, Building2, Users, ArrowRight } from 'lucide-react-native';
import { spacing, typography, radius } from '@/theme';
import { useTheme } from '@/context/ThemeContext';
import { subscriptionService } from '@/services/apiClient';
import type { Subscription, Usage, PlanLimits } from '@/services/apiTypes';

export default function SubscriptionSummaryCard() {
  const { colors } = useTheme();
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [limits, setLimits] = useState<PlanLimits | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);

      const [subscriptionRes, usageRes] = await Promise.all([
        subscriptionService.getSubscription(),
        subscriptionService.getUsage(),
      ]);

      const subscriptionData = subscriptionRes.data;
      setSubscription(subscriptionData);
      setUsage(usageRes.data);

      const limitsRes = await subscriptionService.getLimits(subscriptionData.plan);
      setLimits(limitsRes.data);
    } catch (error) {
      console.error('Failed to fetch subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPlanName = (plan: string) => {
    return plan.charAt(0).toUpperCase() + plan.slice(1);
  };

  const formatLimit = (value: number) => {
    return value === 999 ? '∞' : value;
  };

  const calculateProgressPercentage = (used: number, limit: number) => {
    if (limit === 999) return 10;
    return Math.min((used / limit) * 100, 100);
  };

  if (loading || !subscription || !usage || !limits) {
    return (
      <Card style={styles.card}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary[500]} />
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.planBadge, { backgroundColor: colors.warning[50] }]}>
          <Crown size={16} color={colors.warning[600]} />
          <Text style={[styles.planText, { color: colors.warning[700] }]}>
            {formatPlanName(subscription.plan)} Plan
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/subscription')}
          activeOpacity={0.7}
          style={styles.viewButton}>
          <Text style={[styles.viewButtonText, { color: colors.primary[600] }]}>View</Text>
          <ArrowRight size={14} color={colors.primary[600]} />
        </TouchableOpacity>
      </View>

      <View style={styles.usageSection}>
        <View style={styles.usageItem}>
          <View style={styles.usageHeader}>
            <Building2 size={16} color={colors.primary[500]} />
            <Text style={[styles.usageLabel, { color: colors.text.secondary }]}>Properties</Text>
            <Text style={[styles.usageValue, { color: colors.text.primary }]}>
              {usage.properties} / {formatLimit(limits.properties)}
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.neutral[200] }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${calculateProgressPercentage(usage.properties, limits.properties)}%`,
                  backgroundColor:
                    usage.properties > limits.properties
                      ? colors.danger[500]
                      : colors.primary[500],
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.usageItem}>
          <View style={styles.usageHeader}>
            <Users size={16} color={colors.success[500]} />
            <Text style={[styles.usageLabel, { color: colors.text.secondary }]}>Tenants</Text>
            <Text style={[styles.usageValue, { color: colors.text.primary }]}>
              {usage.tenants} / {formatLimit(limits.tenants)}
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.neutral[200] }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${calculateProgressPercentage(usage.tenants, limits.tenants)}%`,
                  backgroundColor:
                    usage.tenants > limits.tenants
                      ? colors.danger[500]
                      : colors.success[500],
                },
              ]}
            />
          </View>
        </View>
      </View>

      {subscription.plan === 'free' && (
        <TouchableOpacity
          style={[styles.upgradeButton, { backgroundColor: colors.primary[50], borderColor: colors.primary[200] }]}
          onPress={() => router.push('/subscription')}
          activeOpacity={0.7}>
          <Text style={[styles.upgradeButtonText, { color: colors.primary[700] }]}>Upgrade for More</Text>
        </TouchableOpacity>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  loadingContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  planText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    marginLeft: spacing.xs,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    marginRight: spacing.xs,
  },
  usageSection: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  usageItem: {
    gap: spacing.sm,
  },
  usageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  usageLabel: {
    fontSize: typography.fontSize.sm,
    marginLeft: spacing.sm,
    flex: 1,
  },
  usageValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  progressBar: {
    height: 6,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.sm,
  },
  upgradeButton: {
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
  },
  upgradeButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
});
