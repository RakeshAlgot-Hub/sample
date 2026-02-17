
import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { usePropertiesStore } from '@/store/usePropertiesStore';
import { useTheme } from '@/theme/useTheme';
import PropertyDetailsView from '@/components/PropertyDetailsView';

export default function PropertiesScreen() {
  const { properties, activePropertyId, setActiveProperty, loadProperties } = usePropertiesStore();
  const theme = useTheme();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  useEffect(() => {
    if (activePropertyId) setSelectedId(activePropertyId);
    else if (properties.length > 0) setSelectedId(properties[0].id);
  }, [activePropertyId, properties]);

  if (properties.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <Text style={{ color: theme.text }}>No properties found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flex: 1 }}>
        {selectedId && <PropertyDetailsView id={selectedId} source="dashboard" />}
      </View>
    </SafeAreaView>
  );
}
