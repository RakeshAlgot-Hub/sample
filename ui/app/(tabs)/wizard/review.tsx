import { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  BackHandler,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { useWizardStore } from '@/store/useWizardStore';
import { usePropertiesStore } from '@/store/usePropertiesStore';
import WizardHeader from '@/components/WizardHeader';
import WizardTopHeader from '@/components/WizardTopHeader';
import WizardFooter from '@/components/WizardFooter';
import ReviewSummary from '@/components/ReviewSummary';
import TotalStatsCard from '@/components/TotalStatsCard';
import HierarchyCard from '@/components/HierarchyCard';
import { AlertCircle, CheckCircle } from 'lucide-react-native';

interface ValidationError {
  type: 'building' | 'floor' | 'room';
  message: string;
}

export default function ReviewScreen() {
  const theme = useTheme();
  const router = useRouter();
  const {
    propertyDetails,
    buildings,
    allowedBedCounts,
    bedPricing,
    previousStep,
    resetWizard,
    editingPropertyId,
  } = useWizardStore();
  const {
    addProperty,
    updateProperty,
    properties,
    activePropertyId,
    setActiveProperty,
  } = usePropertiesStore();
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const totals = useMemo(() => {
    const totalBuildings = buildings.length;
    const totalFloors = buildings.reduce((acc, building) => acc + building.floors.length, 0);
    const totalRooms = buildings.reduce(
      (acc, building) =>
        acc + building.floors.reduce((sum, floor) => sum + floor.rooms.length, 0),
      0
    );
    const totalBeds = buildings.reduce(
      (acc, building) =>
        acc +
        building.floors.reduce(
          (sum, floor) =>
            sum + floor.rooms.reduce((bedSum, room) => bedSum + room.beds.length, 0),
          0
        ),
      0
    );

    return {
      totalBuildings,
      totalFloors,
      totalRooms,
      totalBeds,
    };
  }, [buildings]);

  const validationErrors = useMemo((): ValidationError[] => {
    const errors: ValidationError[] = [];

    buildings.forEach((building) => {
      if (building.floors.length === 0) {
        errors.push({
          type: 'building',
          message: `Building "${building.name}" has no floors`,
        });
      }

      building.floors.forEach((floor) => {
        if (floor.rooms.length === 0) {
          errors.push({
            type: 'floor',
            message: `Floor ${floor.label} in "${building.name}" has no rooms`,
          });
        }

        floor.rooms.forEach((room) => {
          if (room.beds.length === 0) {
            errors.push({
              type: 'room',
              message: `Room ${room.roomNumber} in "${building.name}" Floor ${floor.label} has no beds`,
            });
          }
        });
      });
    });

    return errors;
  }, [buildings]);

  const isValid = validationErrors.length === 0 && allowedBedCounts.length > 0;

  const getEmptyFloors = useMemo(() => {
    const empty = [];
    for (const building of buildings) {
      for (const floor of building.floors) {
        if (!floor.rooms || floor.rooms.length === 0) {
          empty.push({ buildingName: building.name, floorLabel: floor.label });
        }
      }
    }
    return empty;
  }, [buildings]);

  const handleClose = useCallback(() => {
    resetWizard();
    if (editingPropertyId) {
      router.replace({
        pathname: '/settings/property-details/[id]',
        params: { id: editingPropertyId },
      });
      return;
    }
    router.replace('/(tabs)');
  }, [resetWizard, router, editingPropertyId]);

  const handleBack = useCallback(() => {
    previousStep();
    router.back();
  }, [previousStep, router]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleBack();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => subscription.remove();
    }, [handleBack]),
  );

  const isEditing = Boolean(editingPropertyId);

  const handleFinish = async () => {
    if (!propertyDetails.type || !isValid) return;

    setIsSaving(true);

    // Remove empty floors and buildings before saving
    const cleanedBuildings = buildings
      .map(b => ({
        ...b,
        floors: b.floors.filter(f => f.rooms && f.rooms.length > 0),
      }))
      .filter(b => b.floors.length > 0);

    let nextPropertyId = editingPropertyId ?? null;

    if (isEditing && editingPropertyId) {
      const existing = properties.find((p) => p.id === editingPropertyId);

      await updateProperty(editingPropertyId, {
        name: propertyDetails.name,
        type: propertyDetails.type,
        city: propertyDetails.city,
        area: propertyDetails.area,
        buildings: cleanedBuildings,
        bedPricing,
        totalRooms: totals.totalRooms,
        totalBeds: totals.totalBeds,
        createdAt: existing?.createdAt ?? new Date().toISOString(),
      });
    } else {
      const newProperty = {
        id: Date.now().toString(),
        name: propertyDetails.name,
        type: propertyDetails.type,
        city: propertyDetails.city,
        area: propertyDetails.area,
        buildings: cleanedBuildings,
        bedPricing,
        totalRooms: totals.totalRooms,
        totalBeds: totals.totalBeds,
        createdAt: new Date().toISOString(),
      };

      await addProperty(newProperty);
      nextPropertyId = newProperty.id;

      if (activePropertyId && activePropertyId !== newProperty.id) {
        Alert.alert(
          'Switch Property',
          `Do you want to switch to "${newProperty.name}"?`,
          [
            { text: 'No', style: 'cancel' },
            {
              text: 'Yes',
              onPress: () => {
                void setActiveProperty(newProperty.id);
              },
            },
          ]
        );
      }
    }

    setIsSaving(false);
    setShowSuccess(true);

    setTimeout(() => {
      resetWizard();

      if (editingPropertyId) {
        router.replace({
          pathname: '/settings/property-details/[id]',
          params: { id: editingPropertyId },
        });
        return;
      }

      if (nextPropertyId) {
        router.replace({
          pathname: '/settings/property-details/[id]',
          params: { id: nextPropertyId, source: 'dashboard' },
        });
        return;
      }

      router.replace('/(tabs)');
    }, 800);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <WizardTopHeader
        onBack={handleBack}
        title="Review"
        rightAction="close"
        onClose={handleClose}
      />
      <WizardHeader
        currentStep={6}
        totalSteps={6}
        title="Review"
        onClose={handleClose}
        showClose={false}
        showSteps
        showTitle={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {validationErrors.length > 0 && (
          <View
            style={[
              styles.validationCard,
              { backgroundColor: theme.error + '15', borderColor: theme.error },
            ]}
          >
            <View style={styles.validationHeader}>
              <AlertCircle size={20} color={theme.error} strokeWidth={2} />
              <Text style={[styles.validationTitle, { color: theme.error }]}>
                Validation Errors
              </Text>
            </View>
            <View style={styles.validationList}>
              {validationErrors.map((error, index) => (
                <Text
                  key={index}
                  style={[styles.validationError, { color: theme.textSecondary }]}
                >
                  • {error.message}
                </Text>
              ))}
            </View>
          </View>
        )}

        {getEmptyFloors.length > 0 && (
          <View
            style={[
              styles.validationCard,
              { backgroundColor: theme.warning + '15', borderColor: theme.warning || theme.accent },
            ]}
          >
            <View style={styles.validationHeader}>
              <AlertCircle size={20} color={theme.warning || theme.accent} strokeWidth={2} />
              <Text style={[styles.validationTitle, { color: theme.warning || theme.accent }]}>
                Empty Floors to Remove
              </Text>
            </View>
            <View style={styles.validationList}>
              {getEmptyFloors.map((item, index) => (
                <Text
                  key={index}
                  style={[styles.validationError, { color: theme.textSecondary }]}
                >
                  • Floor {item.floorLabel} in {item.buildingName} (no rooms created)
                </Text>
              ))}
            </View>
            <Text style={[styles.validationNote, { color: theme.textSecondary }]}>
              These floors will be automatically removed when you save.
            </Text>
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Property Details
        </Text>
        <ReviewSummary propertyDetails={propertyDetails} />

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Total Statistics
        </Text>
        <TotalStatsCard
          totalBuildings={totals.totalBuildings}
          totalFloors={totals.totalFloors}
          totalRooms={totals.totalRooms}
          totalBeds={totals.totalBeds}
        />

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Allowed Share Types
        </Text>
        <View
          style={[
            styles.infoCard,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
          ]}
        >
          <Text style={[styles.infoText, { color: theme.text }]}>
            {allowedBedCounts.length > 0
              ? allowedBedCounts.join(', ')
              : 'None selected'}
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Buildings & Hierarchy
        </Text>
        <View style={styles.buildingsList}>
          {buildings.map((building) => (
            <HierarchyCard key={building.id} building={building} />
          ))}
        </View>
      </ScrollView>

      {showSuccess && (
        <View style={[styles.successOverlay, { backgroundColor: theme.background + 'E6' }]}>
          <View
            style={[
              styles.successCard,
              { backgroundColor: theme.success + '15', borderColor: theme.success },
            ]}
          >
            <CheckCircle size={48} color={theme.success} strokeWidth={2} />
            <Text style={[styles.successText, { color: theme.success }]}>
              {isEditing ? 'Property Updated Successfully!' : 'Property Saved Successfully!'}
            </Text>
          </View>
        </View>
      )}

      <WizardFooter
        onBack={handleBack}
        onNext={isSaving ? undefined : handleFinish}
        nextLabel={isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Confirm & Save'}
        nextDisabled={!isValid || isSaving}
        showBack={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 20,
  },
  validationCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  validationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  validationTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  validationList: {
    gap: 6,
    paddingLeft: 8,
  },
  validationError: {
    fontSize: 14,
    lineHeight: 20,
  },
  validationNote: {
    fontSize: 12,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  buildingsList: {
    gap: 16,
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successCard: {
    padding: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    gap: 16,
    marginHorizontal: 40,
  },
  successText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
