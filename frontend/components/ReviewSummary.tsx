import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { PropertyDetails } from '@/types/property';
import { Home, MapPin } from 'lucide-react-native';

interface ReviewSummaryProps {
  propertyDetails: PropertyDetails;
}

export default function ReviewSummary({ propertyDetails }: ReviewSummaryProps) {
  const theme = useTheme();
  const windowWidth = Dimensions.get('window').width;
  const isWideScreen = windowWidth > 768;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.card, borderColor: theme.cardBorder },
        isWideScreen && styles.containerWide,
      ]}
    >
      <View style={[styles.header, isWideScreen && styles.headerWide]}>
        <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }, isWideScreen && styles.iconContainerWide]}>
          <Home size={isWideScreen ? 28 : 24} color={theme.primary} strokeWidth={2} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.propertyName, { color: theme.text }, isWideScreen && styles.propertyNameWide]}>
            {propertyDetails.name}
          </Text>
          {propertyDetails.type && (
            <Text style={[styles.propertyType, { color: theme.textSecondary }, isWideScreen && styles.propertyTypeWide]}>
              {propertyDetails.type}
            </Text>
          )}
        </View>
      </View>

      {propertyDetails.city && (
        <View style={[styles.cityRow, isWideScreen && styles.cityRowWide]}>
          <MapPin size={isWideScreen ? 18 : 16} color={theme.textSecondary} strokeWidth={2} />
          <Text style={[styles.cityText, { color: theme.textSecondary }, isWideScreen && styles.cityTextWide]}>
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
  containerWide: {
    padding: 28,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerWide: {
    gap: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerWide: {
    width: 64,
    height: 64,
    borderRadius: 16,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  propertyName: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  propertyNameWide: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  propertyType: {
    fontSize: 15,
    fontWeight: '600',
  },
  propertyTypeWide: {
    fontSize: 16,
    fontWeight: '600',
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 68,
  },
  cityRowWide: {
    paddingLeft: 80,
    gap: 10,
  },
  cityText: {
    fontSize: 14,
    fontWeight: '500',
  },
  cityTextWide: {
    fontSize: 15,
    fontWeight: '500',
  },
});
