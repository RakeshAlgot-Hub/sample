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
import WizardFooter from '@/components/WizardFooter';
import FloorCard from '@/components/FloorCard';
import FloorSelector from '@/components/FloorSelector';
import { Floor } from '@/types/property';
import { Layers, Plus } from 'lucide-react-native';

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

  const handleAddFloor = () => {
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

      setSelectedFloors([]); // Clear selected floors after adding
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
    nextStep();
    router.push('/wizard/share-types');
  };

  const canAddFloor = selectedFloors.length > 0;
  const hasFloors = floors.length > 0;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <WizardHeader
        currentStep={3}
        totalSteps={6}
        title="Floors"
        onClose={handleClose}
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
                Add Floor to {selectedBuilding.name}
              </Text>
            </View>

            <FloorSelector
              selectedFloors={selectedFloors}
              onSelectFloors={handleSelectFloors}
              existingFloors={existingFloorLabels}
            />

            <TouchableOpacity
              style={[
                styles.addButton,
                {
                  backgroundColor: canAddFloor ? theme.accent : theme.inputBorder,
                },
              ]}
              onPress={handleAddFloor}
              disabled={!canAddFloor}
              activeOpacity={0.8}
            >
              <Plus size={20} color="#ffffff" strokeWidth={2} />
              <Text style={styles.addButtonText}>Add Floor</Text>
            </TouchableOpacity>
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

        {floors.length === 0 && selectedBuilding && (
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
            ]}
          >
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No floors added to {selectedBuilding.name} yet
            </Text>
          </View>
        )}
      </ScrollView>

      <WizardFooter
        onBack={handleBack}
        onNext={handleNext}
        nextLabel="Next"
        nextDisabled={!hasFloors}
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
  addButton: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  floorsList: {
    gap: 12,
  },
  emptyCard: {
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});

