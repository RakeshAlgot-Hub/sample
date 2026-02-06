import { useState, useEffect } from 'react';
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
import { useWizardStore } from '@/store/useWizardStore';
import WizardHeader from '@/components/WizardHeader';
import WizardTopHeader from '@/components/WizardTopHeader';
import WizardFooter from '@/components/WizardFooter';
import FloorCard from '@/components/FloorCard';
import FloorSelector from '@/components/FloorSelector';
import { Floor } from '@/types/property';
import { Layers } from 'lucide-react-native';

export default function FloorsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const {
    buildings,
    addFloor,
    updateFloor,
    removeFloor,
    nextStep,
    previousStep,
    resetWizard,
  } = useWizardStore();

  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(
    buildings[0]?.id || ''
  );
  const [selectedFloors, setSelectedFloors] = useState<string[]>([]);

  useEffect(() => {
    if (buildings.length > 0 && !selectedBuildingId) {
      setSelectedBuildingId(buildings[0].id);
    }
  }, [buildings]);

  const selectedBuilding = buildings.find((b) => b.id === selectedBuildingId);
  const floors = selectedBuilding?.floors || [];
  const existingFloorLabels = floors.map((f) => f.label);

  const handleClose = () => {
    resetWizard();
    router.back();
  };

  const handleBack = () => {
    previousStep();
    router.back();
  };

  const handleSelectFloors = (floors: string[]) => {
    setSelectedFloors(floors);
  };

  const addSelectedFloors = () => {
    if (selectedBuildingId && selectedFloors.length > 0) {
      selectedFloors.forEach((floorLabel) => {
        const trimmedFloorLabel = floorLabel.trim();
        if (
          trimmedFloorLabel &&
          !existingFloorLabels.includes(trimmedFloorLabel)
        ) {
          const floor: Floor = {
            id: Date.now().toString() + Math.random(),
            label: trimmedFloorLabel,
            rooms: [],
          };
          addFloor(selectedBuildingId, floor);
        }
      });

      setSelectedFloors([]);
    }
  };

  const handleUpdateFloor = (floorId: string, label: string) => {
    if (selectedBuildingId) {
      updateFloor(selectedBuildingId, floorId, label);
    }
  };

  const handleRemoveFloor = (floorId: string) => {
    if (selectedBuildingId) {
      removeFloor(selectedBuildingId, floorId);
    }
  };

  const handleNext = () => {
    addSelectedFloors();
    nextStep();
    router.push('/wizard/share-types');
  };

  const hasFloors = floors.length > 0;
  const canProceed = hasFloors || selectedFloors.length > 0;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <WizardTopHeader onBack={handleBack} title="Settings" />
      <WizardHeader
        currentStep={3}
        totalSteps={6}
        title="Floors"
        onClose={handleClose}
        showClose
        showSteps
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Select Building
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.buildingTabs}
          >
            {buildings.map((building) => {
              const isSelected = building.id === selectedBuildingId;
              const hasFloors = building.floors.length > 0;
              return (
                <TouchableOpacity
                  key={building.id}
                  style={[
                    styles.buildingTab,
                    {
                      backgroundColor: isSelected
                        ? theme.primary
                        : theme.inputBackground,
                      borderColor: isSelected ? theme.primary : theme.inputBorder,
                    },
                  ]}
                  onPress={() => setSelectedBuildingId(building.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.buildingTabText,
                      {
                        color: isSelected ? '#ffffff' : theme.text,
                      },
                    ]}
                  >
                    {building.name}
                  </Text>
                  {hasFloors && (
                    <View
                      style={[
                        styles.floorCount,
                        {
                          backgroundColor: isSelected
                            ? '#ffffff'
                            : theme.primary + '15',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.floorCountText,
                          {
                            color: isSelected ? theme.primary : theme.primary,
                          },
                        ]}
                      >
                        {building.floors.length}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {selectedBuilding && (
          <View style={styles.section}>
            <View style={styles.labelContainer}>
              <Layers size={18} color={theme.textSecondary} strokeWidth={2} />
              <Text style={[styles.label, { color: theme.text }]}>
                Select Floors for {selectedBuilding.name}
              </Text>
            </View>

            <FloorSelector
              selectedFloors={selectedFloors}
              onSelectFloors={handleSelectFloors}
              existingFloors={existingFloorLabels}
            />

          </View>
        )}

        {floors.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Floors ({floors.length})
            </Text>
            <View style={styles.floorsList}>
              {floors.map((floor) => (
                <FloorCard
                  key={floor.id}
                  floor={floor}
                  onUpdate={(label) => handleUpdateFloor(floor.id, label)}
                  onRemove={() => handleRemoveFloor(floor.id)}
                />
              ))}
            </View>
          </View>
        )}

      </ScrollView>

      <WizardFooter
        onBack={handleBack}
        onNext={handleNext}
        nextLabel="Next"
        nextDisabled={!canProceed}
        showBack={true}
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
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  buildingTabs: {
    gap: 12,
    paddingVertical: 4,
  },
  buildingTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  buildingTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  floorCount: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floorCountText: {
    fontSize: 12,
    fontWeight: '700',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  floorsList: {
    gap: 12,
  },
});

