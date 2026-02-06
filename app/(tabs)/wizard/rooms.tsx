import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
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
import ConfirmModal from '@/components/ConfirmModal';
import { RoomType } from '@/components/RoomTypeSelector';
import EditableRoomCard from '@/components/EditableRoomCard';
import { DoorOpen, Plus } from 'lucide-react-native';

export default function RoomsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const {
    buildings,
    addRoom,
    removeRoom,
    nextStep,
    previousStep,
    resetWizard,
    allowedBedCounts,
  } = useWizardStore();

  const availableRoomTypes: RoomType[] = useMemo(() => {
    const types: RoomType[] = allowedBedCounts.map(count => {
      let label = `${count} Bed`;
      if (count > 1) label += 's';
      let id: RoomType['id'];

      // Map common bed counts to specific share type IDs
      if (count === 1) id = 'single';
      else if (count === 2) id = 'double';
      else if (count === 3) id = 'triple';
      else id = `custom-${count}`; // Use a generic custom ID for others

      return { id, label, bedCount: count };
    });

    return types.sort((a, b) => a.bedCount - b.bedCount);
  }, [allowedBedCounts]);

  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(
    buildings[0]?.id || ''
  );
  const [selectedFloorId, setSelectedFloorId] = useState<string>('');
  const [roomNumber, setRoomNumber] = useState('');
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{
    buildingId: string;
    floorId: string;
    roomId: string;
  } | null>(null);

  useEffect(() => {
    if (buildings.length === 0) {
      return;
    }

    const selectedExists = buildings.some((b) => b.id === selectedBuildingId);
    const nextBuildingId = !selectedBuildingId || !selectedExists
      ? buildings[0].id
      : selectedBuildingId;

    if (nextBuildingId !== selectedBuildingId) {
      setSelectedBuildingId(nextBuildingId);
    }

    const building = buildings.find((b) => b.id === nextBuildingId);
    if (!building || building.floors.length === 0) {
      if (selectedFloorId) {
        setSelectedFloorId('');
      }
      return;
    }

    const floorExists = building.floors.some((f) => f.id === selectedFloorId);
    if (!selectedFloorId || !floorExists) {
      setSelectedFloorId(building.floors[0].id);
    }
  }, [buildings, selectedBuildingId, selectedFloorId]);

  const selectedBuilding = buildings.find((b) => b.id === selectedBuildingId);
  const selectedFloor = selectedBuilding?.floors.find(
    (f) => f.id === selectedFloorId
  );
  const existingRooms = selectedFloor?.rooms || [];
  const hasBuildings = buildings.length > 0;
  const hasFloors = !!selectedBuilding && selectedBuilding.floors.length > 0;
  const hasRoomTypes = availableRoomTypes.length > 0;

  const handleClose = () => {
    resetWizard();
    router.back();
  };

  const handleBack = () => {
    previousStep();
    router.back();
  };

  const handleBuildingChange = (buildingId: string) => {
    setSelectedBuildingId(buildingId);
    const building = buildings.find((b) => b.id === buildingId);
    if (building && building.floors.length > 0) {
      setSelectedFloorId(building.floors[0].id);
    }
    setRoomNumber('');
    setSelectedRoomType(null);
  };

  const handleFloorChange = (floorId: string) => {
    setSelectedFloorId(floorId);
    setRoomNumber('');
    setSelectedRoomType(null);
  };

  const handleAddRoom = () => {
    if (!selectedBuildingId || !selectedFloorId || !roomNumber.trim() || !selectedRoomType) {
      return;
    }

    const shareType = getShareTypeFromBedCount(selectedRoomType.bedCount);
    addRoom(selectedBuildingId, selectedFloorId, {
      id: Date.now().toString() + Math.random(),
      roomNumber: roomNumber.trim(),
      shareType,
      bedCount: selectedRoomType.bedCount,
      beds: [],
    });

    // Clear form for next room
    setRoomNumber('');
    setSelectedRoomType(null);
  };

  const getShareTypeFromBedCount = (bedCount: number): 'single' | 'double' | 'triple' => {
    if (bedCount === 1) return 'single';
    if (bedCount === 2) return 'double';
    return 'triple';
  };

  const handleNext = () => {
    nextStep();
    router.push('/wizard/review');
  };

  const handleRemoveRoom = (roomId: string) => {
    if (!selectedBuildingId || !selectedFloorId) return;
    setPendingDelete({
      buildingId: selectedBuildingId,
      floorId: selectedFloorId,
      roomId,
    });
  };

  const canProceed = true;



  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <WizardTopHeader onBack={handleBack} title="Settings" />
      <WizardHeader
        currentStep={5}
        totalSteps={6}
        title="Rooms"
        onClose={handleClose}
        showClose
        showSteps
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {hasBuildings ? (
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
                return (
                  <TouchableOpacity
                    key={building.id}
                    style={[
                      styles.tab,
                      {
                        backgroundColor: isSelected
                          ? theme.primary
                          : theme.inputBackground,
                        borderColor: isSelected ? theme.primary : theme.inputBorder,
                      },
                    ]}
                    onPress={() => handleBuildingChange(building.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        { color: isSelected ? '#ffffff' : theme.text },
                      ]}
                    >
                      {building.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No buildings yet</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Add a building first so you can create rooms.
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: theme.primary }]}
              onPress={() => router.push('/wizard/buildings')}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyButtonText}>Go to Buildings</Text>
            </TouchableOpacity>
          </View>
        )}

        {hasFloors ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Select Floor
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.floorTabs}
            >
              {selectedBuilding.floors.map((floor) => {
                const isSelected = floor.id === selectedFloorId;
                const hasRooms = floor.rooms.length > 0;
                return (
                  <TouchableOpacity
                    key={floor.id}
                    style={[
                      styles.tab,
                      {
                        backgroundColor: isSelected
                          ? theme.primary
                          : theme.inputBackground,
                        borderColor: isSelected
                          ? theme.primary
                          : theme.inputBorder,
                      },
                    ]}
                    onPress={() => handleFloorChange(floor.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        { color: isSelected ? '#ffffff' : theme.text },
                      ]}
                    >
                      Floor {floor.label}
                    </Text>
                    {hasRooms && (
                      <View
                        style={[
                          styles.count,
                          {
                            backgroundColor: isSelected
                              ? '#ffffff'
                              : theme.primary + '15',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.countText,
                            {
                              color: isSelected ? theme.primary : theme.primary,
                            },
                          ]}
                        >
                          {floor.rooms.length}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ) : (
          selectedBuilding && (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No floors yet</Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Add a floor to start creating rooms.
              </Text>
              <TouchableOpacity
                style={[styles.emptyButton, { backgroundColor: theme.primary }]}
                onPress={() => router.push('/wizard/floors')}
                activeOpacity={0.8}
              >
                <Text style={styles.emptyButtonText}>Go to Floors</Text>
              </TouchableOpacity>
            </View>
          )
        )}


        {selectedFloor && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Add Room to Floor {selectedFloor.label}
            </Text>

            <View style={styles.formField}>
              <View style={styles.labelContainer}>
                <DoorOpen
                  size={18}
                  color={theme.textSecondary}
                  strokeWidth={2}
                />
                <Text style={[styles.label, { color: theme.text }]}>
                  Room Number
                </Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.inputBorder,
                    color: theme.text,
                  },
                ]}
                placeholder="e.g., 101, 201, A1"
                placeholderTextColor={theme.textSecondary}
                value={roomNumber}
                onChangeText={setRoomNumber}
                keyboardType="default"
              />
            </View>

            <View style={styles.formField}>
              <Text style={[styles.label, { color: theme.text }]}>
                Room Type
              </Text>
              {hasRoomTypes ? (
                <View style={styles.roomTypeGrid}>
                  {availableRoomTypes.map((type) => {
                    const isSelected = selectedRoomType?.id === type.id;
                    return (
                      <TouchableOpacity
                        key={type.id}
                        style={[
                          styles.roomTypeButton,
                          {
                            backgroundColor: isSelected
                              ? theme.primary
                              : theme.inputBackground,
                            borderColor: isSelected
                              ? theme.primary
                              : theme.inputBorder,
                          },
                        ]}
                        onPress={() => setSelectedRoomType(type)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.roomTypeText,
                            { color: isSelected ? '#ffffff' : theme.text },
                          ]}
                        >
                          {type.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.emptyInline}>
                  <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                    No bed counts selected. Go back to Share Types and pick at least one.
                  </Text>
                  <TouchableOpacity
                    style={[styles.emptyButton, { backgroundColor: theme.primary }]}
                    onPress={() => router.push('/wizard/share-types')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.emptyButtonText}>Go to Share Types</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.addButton,
                {
                  backgroundColor:
                    roomNumber.trim() && selectedRoomType
                      ? theme.primary
                      : theme.inputBorder,
                },
              ]}
              onPress={handleAddRoom}
              disabled={!roomNumber.trim() || !selectedRoomType}
              activeOpacity={0.7}
            >
              <Plus size={20} color="#ffffff" strokeWidth={2} />
              <Text style={styles.addButtonText}>Add Room</Text>
            </TouchableOpacity>
          </View>
        )}

        {existingRooms.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Saved Rooms ({existingRooms.length})
            </Text>
            <View style={styles.roomsList}>
              {existingRooms.map((room) => (
                <EditableRoomCard
                  key={room.id}
                  roomNumber={room.roomNumber}
                  shareType={room.shareType}
                  bedCount={room.bedCount ?? room.beds.length}
                  onUpdate={() => { }}
                  onRemove={() => {
                    handleRemoveRoom(room.id);
                  }}
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
      <ConfirmModal
        visible={pendingDelete !== null}
        title="Delete Room"
        message="Delete this room and its beds?"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            removeRoom(pendingDelete.buildingId, pendingDelete.floorId, pendingDelete.roomId);
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
    padding: 20,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  emptyState: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00000010',
    gap: 8,
  },
  emptyInline: {
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 18,
  },
  emptyButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  buildingTabs: {
    gap: 12,
    paddingVertical: 4,
  },
  floorTabs: {
    gap: 12,
    paddingVertical: 4,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  count: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
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
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  formField: {
    gap: 8,
  },
  roomTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  roomTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  roomTypeText: {
    fontSize: 14,
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
  roomsList: {
    gap: 12,
  },
});
