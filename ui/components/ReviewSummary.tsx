import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { PropertyDetails } from '@/types/property';
import { Home, MapPin } from 'lucide-react-native';

interface ReviewSummaryProps {
  propertyDetails: PropertyDetails;
}

export default function ReviewSummary({ propertyDetails }: ReviewSummaryProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.card, borderColor: theme.cardBorder },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }]}>
          <Home size={24} color={theme.primary} strokeWidth={2} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.propertyName, { color: theme.text }]}>
            {propertyDetails.name}
          </Text>
          {propertyDetails.type && (
            <Text style={[styles.propertyType, { color: theme.textSecondary }]}>
              {propertyDetails.type}
            </Text>
          )}
        </View>
      </View>

      {propertyDetails.city && (
        <View style={styles.cityRow}>
          <MapPin size={16} color={theme.textSecondary} strokeWidth={2} />
          <Text style={[styles.cityText, { color: theme.textSecondary }]}>
            {propertyDetails.city}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  propertyName: {
    fontSize: 22,
    fontWeight: '700',
  },
  propertyType: {
    fontSize: 15,
    fontWeight: '600',
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 68,
  },
  cityText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
