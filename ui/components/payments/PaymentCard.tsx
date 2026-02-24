import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { paymentService } from '@/services/paymentService';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Theme';
import { PaymentData } from '@/services/paymentService';

interface PaymentCardProps {
  payment: PaymentData;
  onStatusChanged?: () => void;
}

export default function PaymentCard({ payment, onStatusChanged }: PaymentCardProps) {
  const [localStatus, setLocalStatus] = useState<'paid' | 'due'>(payment.status);
  const [updating, setUpdating] = useState(false);

  const tenantName = payment.tenantName || 'Unknown Tenant';
  const unitName = payment.unitName || 'N/A';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
    });
  };

  const handleStatusToggle = async () => {
    if (updating) return;

    const nextStatus = localStatus === 'due' ? 'paid' : 'due';
    setUpdating(true);
    try {
      await paymentService.updatePaymentStatus(payment.id, nextStatus);
      setLocalStatus(nextStatus);
      if (onStatusChanged) onStatusChanged();
    } catch (e) {
      console.error('Failed to update payment status:', e);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        localStatus === 'paid' && styles.cardPaid,
      ]}
      onPress={handleStatusToggle}
      activeOpacity={0.7}
      disabled={updating}>
      <View style={styles.row}>
        <View style={styles.leftSection}>
          <View style={styles.tenantInfo}>
            <Text style={styles.tenantName} numberOfLines={1}>
              {tenantName}
            </Text>
            <Text style={styles.unitName}>Unit {unitName}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.amount}>{formatCurrency(payment.amount)}</Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.date}>
              {localStatus === 'paid' && payment.paidDate
                ? formatDate(payment.paidDate)
                : formatDate(payment.dueDate)}
            </Text>
          </View>
        </View>
        <View style={styles.rightSection}>
          <View
            style={[
              styles.statusBadge,
              localStatus === 'paid' && styles.statusBadgePaid,
            ]}>
            <Text
              style={[
                styles.statusText,
                localStatus === 'paid' && styles.statusTextPaid,
              ]}>
              {localStatus === 'paid' ? 'Paid' : 'Due'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background.paper,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderLeftWidth: 3,
    borderColor: Colors.border.light,
    borderLeftColor: Colors.warning,
  },
  cardPaid: {
    borderLeftColor: Colors.success,
    backgroundColor: Colors.successLight,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flex: 1,
    gap: 4,
  },
  tenantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tenantName: {
    fontSize: Fonts.size.base,
    fontWeight: Fonts.weight.semiBold,
    color: Colors.text.primary,
    flex: 1,
  },
  unitName: {
    fontSize: Fonts.size.xs,
    color: Colors.text.secondary,
    fontWeight: Fonts.weight.medium,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  amount: {
    fontSize: Fonts.size.sm,
    fontWeight: Fonts.weight.semiBold,
    color: Colors.text.primary,
  },
  separator: {
    fontSize: Fonts.size.xs,
    color: Colors.text.disabled,
  },
  date: {
    fontSize: Fonts.size.sm,
    color: Colors.text.secondary,
  },
  rightSection: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.warningLight,
  },
  statusBadgePaid: {
    backgroundColor: Colors.success,
  },
  statusText: {
    fontSize: Fonts.size.xs,
    fontWeight: Fonts.weight.bold,
    color: Colors.warning,
  },
  statusTextPaid: {
    color: Colors.background.paper,
  },
});