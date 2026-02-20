import { View, Text, StyleSheet, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import PaymentCard from '@/components/payments/PaymentCard';
import { paymentService, PaymentData } from '@/services/paymentService';
import { usePropertyStore } from '@/store/property';
import { Colors } from '@/constants/Colors';
import { Fonts, Spacing, BorderRadius } from '@/constants/Theme';

type TabType = 'paid' | 'due';


export default function PaymentsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('due');
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const selectedPropertyId = usePropertyStore((s) => s.selectedPropertyId);

  useEffect(() => {
    loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedPropertyId]);

  const loadPayments = async () => {
    if (!selectedPropertyId) {
      setPayments([]);
      setError('No property selected');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      let data: PaymentData[] = [];

      switch (activeTab) {
        case 'paid':
          data = await paymentService.getPaidPayments(selectedPropertyId);
          break;
        case 'due':
          data = await paymentService.getDuePayments(selectedPropertyId);
          break;
      }

      setPayments(data);
    } catch (err) {
      setError('Failed to load payments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const tabConfig = {
    paid: { label: 'Paid', count: payments.length },
    due: { label: 'Due', count: payments.length },
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No {activeTab} payments</Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'paid' && 'All payments have been processed'}
        {activeTab === 'due' && 'No overdue payments'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        {(['paid', 'due'] as TabType[]).map((tab) => (
          <Pressable
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.tabActive,
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab && styles.tabLabelActive,
              ]}
            >
              {tabConfig[tab].label}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : payments.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={payments}
          renderItem={({ item }) => (
            <PaymentCard
              payment={item}
              status={activeTab}
              onStatusChanged={loadPayments}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
          nestedScrollEnabled={true}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.medium,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral[100],
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    backgroundColor: Colors.primary,
    borderBottomColor: Colors.primary,
  },
  tabLabel: {
    fontSize: Fonts.size.sm,
    fontWeight: Fonts.weight.semiBold,
    color: Colors.text.secondary,
  },
  tabLabelActive: {
    color: Colors.background.paper,
  },
  listContent: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
  },
  errorText: {
    fontSize: Fonts.size.md,
    color: Colors.danger,
    fontWeight: Fonts.weight.semiBold,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
  },
  emptyTitle: {
    fontSize: Fonts.size.lg,
    fontWeight: Fonts.weight.semiBold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Fonts.size.md,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});
