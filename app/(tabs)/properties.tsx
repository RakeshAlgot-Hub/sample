import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { usePropertiesStore } from '@/store/usePropertiesStore';
import PropertyCard from '@/components/PropertyCard';
import { Home, Plus } from 'lucide-react-native';

export default function PropertiesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { properties, loadProperties } = usePropertiesStore();

  useEffect(() => {
    loadProperties();
  }, []);

  const handleCreateProperty = () => {
    router.push('/wizard/property-details');
  };

  if (properties.length === 0) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View style={styles.emptyContent}>
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
            ]}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: theme.primary + '15' },
              ]}
            >
              <Home size={48} color={theme.primary} strokeWidth={2} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No Properties Yet
            </Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Get started by creating your first property
            </Text>
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: theme.accent }]}
              onPress={handleCreateProperty}
              activeOpacity={0.8}
            >
              <Plus size={20} color="#ffffff" strokeWidth={2} />
              <Text style={styles.createButtonText}>Create Property</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView contentContainerStyle={styles.listContent}>
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </ScrollView>
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.accent }]}
        onPress={handleCreateProperty}
        activeOpacity={0.8}
      >
        <Plus size={24} color="#ffffff" strokeWidth={2} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCard: {
    padding: 28,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 14,
    width: '100%',
    maxWidth: 400,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 6,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    paddingHorizontal: 22,
    borderRadius: 12,
    gap: 8,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
    gap: 14,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
