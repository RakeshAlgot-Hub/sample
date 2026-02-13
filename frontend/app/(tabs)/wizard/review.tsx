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
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { useWizardStore } from '@/store/useWizardStore';
import { usePropertiesStore } from '@/store/usePropertiesStore';
import * as propertyService from '@/services/propertyService';
import * as buildingService from '@/services/buildingService';
import * as floorService from '@/services/floorService';
import * as roomService from '@/services/roomService';
import WizardHeader from '@/components/WizardHeader';
import WizardTopHeader from '@/components/WizardTopHeader';
import WizardFooter from '@/components/WizardFooter';
import ReviewSummary from '@/components/ReviewSummary';
import TotalStatsCard from '@/components/TotalStatsCard';
import HierarchyCard from '@/components/HierarchyCard';
import { CheckCircle } from 'lucide-react-native';

interface ValidationError {
  type: 'building' | 'floor' | 'room';
  message: string;
}

export default function ReviewScreen() {
  const theme = useTheme();
  const router = useRouter();
  const windowWidth = Dimensions.get('window').width;
  const isWideScreen = windowWidth > 768;
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

  // Totals will be returned from backend summary after each creation
  const [totals, setTotals] = useState({
    totalBuildings: 0,
    totalFloors: 0,
    totalRooms: 0,
    totalBeds: 0,
  });

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
    // Create property
    const propertySummary = await propertyService.createProperty({
      name: propertyDetails.name,
      type: propertyDetails.type as string,
      city: propertyDetails.city,
      area: propertyDetails.area ?? '',
    });
    // If backend returns totals in propertySummary, use them; otherwise, skip
    setTotals({
      totalBuildings: (propertySummary as any).totalBuildings ?? 0,
      totalFloors: (propertySummary as any).totalFloors ?? 0,
      totalRooms: (propertySummary as any).totalRooms ?? 0,
      totalBeds: (propertySummary as any).totalBeds ?? 0,
    });
    const propertyId = propertySummary.id;
    // Progressive creation of buildings, floors, rooms
    for (const building of buildings) {
      const buildingSummary = await buildingService.createBuilding(propertyId, { name: building.name });
      // Do not expect totals on buildingSummary
      for (const floor of building.floors) {
        const floorSummary = await floorService.createFloor(propertyId, buildingSummary.id, { name: floor.label });
        // Do not expect totals on floorSummary
        for (const room of floor.rooms) {
          await roomService.createRoom(propertyId, buildingSummary.id, floorSummary.id, { name: room.roomNumber, shareType: room.shareType });
          // If you have a bedService, call it here for each bed (not shown in provided services)
        }
      }
    }
    // Optionally update Zustand store with backend summary (if needed)
    await addProperty({
      ...propertySummary,
      area: propertySummary.area ?? '',
    });
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
      if (propertyId) {
        router.replace({
          pathname: '/settings/property-details/[id]',
          params: { id: propertyId, source: 'dashboard' },
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

      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent, 
          isWideScreen && styles.scrollContentWide
        ]}
      >
        {/* Header Section */}
        <View style={[styles.headerSection, isWideScreen && styles.headerSectionWide]}>
          <ReviewSummary propertyDetails={propertyDetails} />
          
          {isWideScreen && (
            <View style={styles.emptySpace} />
          )}
        </View>

        {/* Stats Grid */}
        <View style={[styles.statsGrid, isWideScreen && styles.statsGridWide]}>
          <TotalStatsCard
            totalBuildings={totals.totalBuildings}
            totalFloors={totals.totalFloors}
            totalRooms={totals.totalRooms}
            totalBeds={totals.totalBeds}
          />
        </View>

        {/* Buildings Hierarchy */}
        <View style={styles.hierarchySection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Property Structure
          </Text>
          <View style={[styles.buildingsList, isWideScreen && styles.buildingsListWide]}>
            {buildings.map((building, index) => (
              <View key={building.id} style={isWideScreen ? {} : {}}>
                <HierarchyCard building={building} />
              </View>
            ))}
          </View>
        </View>

        {/* Spacer for footer */}
        <View style={{ height: Platform.select({ web: 20, default: 40 }) }} />
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
    padding: 16,
    gap: 24,
  },
  scrollContentWide: {
    paddingHorizontal: 32,
    paddingVertical: 24,
    gap: 32,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  headerSection: {
    gap: 16,
  },
  headerSectionWide: {
    marginBottom: 8,
  },
  emptySpace: {
    flex: 1,
  },
  statsGrid: {
    gap: 12,
  },
  statsGridWide: {
    marginVertical: 16,
  },
  hierarchySection: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  buildingsList: {
    gap: 12,
  },
  buildingsListWide: {
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
});
