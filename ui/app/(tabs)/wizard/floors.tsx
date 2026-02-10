import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { useWizardStore } from '@/store/useWizardStore';
import WizardHeader from '@/components/WizardHeader';
import WizardTopHeader from '@/components/WizardTopHeader';
import WizardFooter from '@/components/WizardFooter';
import ConfirmModal from '@/components/ConfirmModal';
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
    editingPropertyId,
  } = useWizardStore();

  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(
    buildings[0]?.id || ''
  );
  const [selectedFloorsByBuilding, setSelectedFloorsByBuilding] = useState<Record<string, string[]>>({});
  const [pendingDelete, setPendingDelete] = useState<{
    buildingId: string;
    floorId: string;
  } | null>(null);

  useEffect(() => {
    if (buildings.length === 0) {
      return;
    }

    const selectedExists = buildings.some((b) => b.id === selectedBuildingId);
    if (!selectedBuildingId || !selectedExists) {
      setSelectedBuildingId(buildings[0].id);
    }
  }, [buildings, selectedBuildingId]);

  useEffect(() => {
    if (!selectedBuildingId) {
      return;
    }

    setSelectedFloorsByBuilding((prev) =>
      prev[selectedBuildingId]
        ? prev
        : { ...prev, [selectedBuildingId]: [] }
    );
  }, [selectedBuildingId]);

  const selectedBuilding = buildings.find((b) => b.id === selectedBuildingId);
  const floors = selectedBuilding?.floors || [];
  const selectedFloors = selectedBuildingId
    ? selectedFloorsByBuilding[selectedBuildingId] || []
    : [];
  const existingFloorLabels = floors.map((f) => f.label);

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

  const handleSelectFloors = (floors: string[]) => {
    if (!selectedBuildingId) {
      return;
    }

    setSelectedFloorsByBuilding((prev) => ({
      ...prev,
      [selectedBuildingId]: floors,
    }));
  };

  const addSelectedFloors = (buildingId?: string) => {
    const entries: Array<[string, string[]]> = buildingId
      ? [[buildingId, selectedFloorsByBuilding[buildingId] ?? []]]
      : Object.entries(selectedFloorsByBuilding).map(([id, floors]) => [id, floors ?? []]);

    entries.forEach(([currentBuildingId, floorLabels]) => {
      if (floorLabels.length === 0) {
        return;
      }

      const existing = buildings
        .find((b) => b.id === currentBuildingId)
        ?.floors.map((f) => f.label) || [];

      floorLabels.forEach((floorLabel: string) => {
        const trimmedFloorLabel = floorLabel.trim();
        if (trimmedFloorLabel && !existing.includes(trimmedFloorLabel)) {
          const floor: Floor = {
            id: Date.now().toString() + Math.random(),
            label: trimmedFloorLabel,
            rooms: [],
          };
          addFloor(currentBuildingId, floor);
        }
      });
    });

    if (buildingId) {
      setSelectedFloorsByBuilding((prev) => ({
        ...prev,
        [buildingId]: [],
      }));
      return;
    }

    setSelectedFloorsByBuilding({});
  };

  const handleUpdateFloor = (floorId: string, label: string) => {
    if (selectedBuildingId) {
      updateFloor(selectedBuildingId, floorId, label);
    }
  };

  const handleRemoveFloor = (floorId: string) => {
    if (selectedBuildingId) {
      setPendingDelete({ buildingId: selectedBuildingId, floorId });
    }
  };

  const handleNext = () => {
    addSelectedFloors();
    nextStep();
    router.push('/wizard/share-types');
  };

  const hasFloors = buildings.some((building) => building.floors.length > 0);
  const hasPendingSelections = Object.values(selectedFloorsByBuilding).some(
    (floorLabels) => floorLabels.length > 0
  );
  const canProceed = hasFloors || hasPendingSelections;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <WizardTopHeader
        onBack={handleBack}
        title="Floors"
        rightAction="close"
        onClose={handleClose}
      />
      <WizardHeader
        currentStep={3}
        totalSteps={6}
        title="Floors"
        onClose={handleClose}
        showClose={false}
        showSteps
        showTitle={false}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Building</Text>
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
              <Layers size={16} color={theme.textSecondary} strokeWidth={2} />
              <Text style={[styles.label, { color: theme.text }]}>
                Floors for {selectedBuilding.name}
              </Text>
            </View>

            <FloorSelector
              selectedFloors={selectedFloors}
              onSelectFloors={handleSelectFloors}
              existingFloors={existingFloorLabels}
            />

            <TouchableOpacity
              style={[
                styles.addSelectedButton,
                {
                  backgroundColor: selectedFloors.length > 0
                    ? theme.primary
                    : theme.inputBorder,
                },
              ]}
              onPress={() => addSelectedFloors(selectedBuilding.id)}
              disabled={selectedFloors.length === 0}
              activeOpacity={0.7}
            >
              <Text style={styles.addSelectedText}>Add Selected Floors</Text>
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


      </ScrollView>

      <WizardFooter
        onBack={handleBack}
        onNext={handleNext}
        nextLabel="Next"
        nextDisabled={!canProceed}
          showBack={false}
      />
      <ConfirmModal
        visible={pendingDelete !== null}
        title="Delete Floor"
        message="Delete this floor and all its rooms and beds?"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            removeFloor(pendingDelete.buildingId, pendingDelete.floorId);
          }
          setPendingDelete(null);
        }}
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
    paddingBottom: 100,
    gap: 14,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  buildingTabs: {
    gap: 8,
    paddingVertical: 4,
  },
  buildingTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    gap: 6,
  },
  buildingTabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  floorCount: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floorCountText: {
    fontSize: 11,
    fontWeight: '700',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  floorsList: {
    gap: 8,
  },
  addSelectedButton: {
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addSelectedText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
});

