import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { usePropertiesStore } from '@/store/usePropertiesStore';
import ManageHeader from '@/components/ManageHeader';

export default function SwitchPropertyScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { properties, activePropertyId, setActiveProperty } = usePropertiesStore();

  const handleBack = () => {
    router.replace('/properties');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}> 
      <ManageHeader title="Switch Property" onBack={handleBack} />
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Switch Property</Text>
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        {properties.map((property) => (
          <TouchableOpacity
            key={property.id}
            style={[
              styles.propertyItem,
              { borderColor: theme.cardBorder, backgroundColor: property.id === activePropertyId ? theme.primary + '15' : theme.card },
            ]}
            onPress={() => {
              setActiveProperty(property.id);
              router.replace('/(tabs)/properties');
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.propertyName, { color: theme.text }]}>{property.name}</Text>
            <Text style={[styles.propertyType, { color: theme.textSecondary }]}>{property.type}</Text>
            {property.city ? (
              <Text style={[styles.propertyCity, { color: theme.textSecondary }]}>{property.city}</Text>
            ) : null}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 18,
    borderBottomWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  list: {
    padding: 16,
    gap: 14,
  },
  propertyItem: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 18,
    marginBottom: 10,
  },
  propertyName: {
    fontSize: 16,
    fontWeight: '700',
  },
  propertyType: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  propertyCity: {
    fontSize: 12,
    marginTop: 2,
  },
});
