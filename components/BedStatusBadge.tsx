import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { Bed } from 'lucide-react-native';

interface BedStatusBadgeProps {
  bedId: string;
  occupied: boolean;
  compact?: boolean;
}

export default function BedStatusBadge({ bedId, occupied, compact = false }: BedStatusBadgeProps) {
  const theme = useTheme();

  const statusColor = occupied ? theme.error : theme.success;
  const statusLabel = occupied ? 'Occupied' : 'Available';

  if (compact) {
    return (
      <View
        style={[
          styles.compactBadge,
          { backgroundColor: statusColor + '15', borderColor: statusColor },
        ]}
      >
        <Bed size={12} color={statusColor} strokeWidth={2} />
        <Text style={[styles.compactText, { color: statusColor }]}>
          {bedId}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: statusColor + '15', borderColor: statusColor },
      ]}
    >
      <Bed size={16} color={statusColor} strokeWidth={2} />
      <Text style={[styles.bedId, { color: theme.text }]}>
        Bed {bedId}
      </Text>
      <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
      <Text style={[styles.statusText, { color: statusColor }]}>
        {statusLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  bedId: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  compactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  compactText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
