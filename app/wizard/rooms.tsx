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
import WizardFooter from '@/components/WizardFooter';
import RoomTypeSelector, { RoomType } from '@/components/RoomTypeSelector';
import RoomAssignmentCard from '@/components/RoomAssignmentCard';
import RoomTypeSelectionModal from '@/components/RoomTypeSelectionModal';
import EditableRoomCard from '@/components/EditableRoomCard';
import { DoorOpen, AlertCircle, Hash, ChevronRight, CheckCircle } from 'lucide-react-native';

type FlowStep = 'count' | 'generate' | 'assign';

type GeneratedRoom = {
  tempId: string;
  roomNumber: string;
};

type RoomAssignment = {
  [tempId: string]: RoomType;
};

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

  const [step, setStep] = useState<FlowStep>('count');




  const [roomCount, setRoomCount] = useState('');
  const [startingRoomNumber, setStartingRoomNumber] = useState('');
  const [generatedRooms, setGeneratedRooms] = useState<GeneratedRoom[]>([]);

  const [roomAssignments, setRoomAssignments] = useState<RoomAssignment>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRoomForAssignment, setSelectedRoomForAssignment] = useState<string | null>(null);

  useEffect(() => {
    if (buildings.length > 0) {
      if (!selectedBuildingId) {
        setSelectedBuildingId(buildings[0].id);
      }
      const building = buildings.find((b) => b.id === selectedBuildingId);
      if (building && building.floors.length > 0 && !selectedFloorId) {
        setSelectedFloorId(building.floors[0].id);
      }
    }
  }, [buildings, selectedBuildingId]);

  const selectedBuilding = buildings.find((b) => b.id === selectedBuildingId);
  const selectedFloor = selectedBuilding?.floors.find(
    (f) => f.id === selectedFloorId
  );
  const existingRooms = selectedFloor?.rooms || [];

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
    resetFlowState();
  };

  const handleFloorChange = (floorId: string) => {
    setSelectedFloorId(floorId);
    resetFlowState();
  };

  const resetFlowState = () => {
    setStep('count');
    setRoomCount('');
    setStartingRoomNumber('');
    setGeneratedRooms([]);
    setRoomAssignments({});
  };

  const getSuggestedStartingRoom = (floorLabel: string): string => {
    if (floorLabel === 'G' || floorLabel === '0') {
      return '001';
    }
    const floorNum = parseInt(floorLabel);
    if (!isNaN(floorNum)) {
      return `${floorNum}01`;
    }
    return '001';
  };







  const handleRoomCountNext = () => {
    if (selectedFloor && roomCount && parseInt(roomCount) > 0) {
      const suggested = getSuggestedStartingRoom(selectedFloor.label);
      setStartingRoomNumber(suggested);
      setStep('generate');
    }
  };

  const handleGenerateRooms = () => {
    if (!startingRoomNumber.trim()) return;

    const count = parseInt(roomCount);
    const rooms: GeneratedRoom[] = [];

    const isNumeric = /^\d+$/.test(startingRoomNumber);

    for (let i = 0; i < count; i++) {
      let roomNumber: string;
      if (isNumeric) {
        const num = parseInt(startingRoomNumber) + i;
        roomNumber = num.toString().padStart(startingRoomNumber.length, '0');
      } else {
        roomNumber = `${startingRoomNumber}-${i + 1}`;
      }

      rooms.push({
        tempId: `temp-${Date.now()}-${i}`,
        roomNumber,
      });
    }

    setGeneratedRooms(rooms);
    setStep('assign');
  };

  const handleUpdateRoom = (tempId: string, newRoomNumber: string) => {
    setGeneratedRooms((prev) =>
      prev.map((room) =>
        room.tempId === tempId ? { ...room, roomNumber: newRoomNumber } : room
      )
    );
  };

  const handleRemoveRoom = (tempId: string) => {
    setGeneratedRooms((prev) => prev.filter((room) => room.tempId !== tempId));
    setRoomAssignments((prev) => {
      const updated = { ...prev };
      delete updated[tempId];
      return updated;
    });
  };

  const handleOpenAssignmentModal = (tempId: string) => {
    setSelectedRoomForAssignment(tempId);
    setModalVisible(true);
  };

  const handleAssignRoomType = (type: RoomType) => {
    if (selectedRoomForAssignment) {
      setRoomAssignments((prev) => ({
        ...prev,
        [selectedRoomForAssignment]: type,
      }));
    }
  };

  const allRoomsAssigned = generatedRooms.every((room) => roomAssignments[room.tempId]);

  const handleSaveRooms = () => {
    if (!selectedBuildingId || !selectedFloorId) return;

    generatedRooms.forEach((room) => {
      const assignment = roomAssignments[room.tempId];
      if (assignment) {
        const shareType = getShareTypeFromBedCount(assignment.bedCount);
        addRoom(selectedBuildingId, selectedFloorId, {
          id: Date.now().toString() + Math.random(),
          roomNumber: room.roomNumber,
          shareType,
          beds: [],
        });
      }
    });

    resetFlowState();
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

  const floorsWithoutRooms = buildings.flatMap((building) =>
    building.floors
      .filter((floor) => floor.rooms.length === 0)
      .map((floor) => ({ buildingName: building.name, floorLabel: floor.label }))
  );
  const canProceed = floorsWithoutRooms.length === 0;



  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <WizardHeader
        currentStep={5}
        totalSteps={6}
        title="Rooms"
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

        {selectedBuilding && selectedBuilding.floors.length > 0 && (
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
        )}

        {floorsWithoutRooms.length > 0 && (
          <View
            style={[
              styles.warningCard,
              {
                backgroundColor: theme.warning + '15',
                borderColor: theme.warning,
              },
            ]}
          >
            <AlertCircle size={20} color={theme.warning} strokeWidth={2} />
            <View style={styles.warningTextContainer}>
              <Text style={[styles.warningTitle, { color: theme.warning }]}>
                Missing Rooms
              </Text>
              <Text
                style={[styles.warningText, { color: theme.textSecondary }]}
              >
                {floorsWithoutRooms.length} floor(s) need at least one room
              </Text>
            </View>
          </View>
        )}



        {selectedFloor && step === 'count' && (
          <View style={styles.section}>
            <View style={styles.labelContainer}>
              <DoorOpen
                size={18}
                color={theme.textSecondary}
                strokeWidth={2}
              />
              <Text style={[styles.label, { color: theme.text }]}>
                How many rooms for Floor {selectedFloor.label}?
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
              placeholder="Enter number of rooms"
              placeholderTextColor={theme.textSecondary}
              value={roomCount}
              onChangeText={setRoomCount}
              keyboardType="number-pad"
              autoFocus
            />

            <TouchableOpacity
              style={[
                styles.nextButton,
                {
                  backgroundColor:
                    roomCount && parseInt(roomCount) > 0
                      ? theme.primary
                      : theme.inputBorder,
                },
              ]}
              onPress={handleRoomCountNext}
              disabled={!roomCount || parseInt(roomCount) <= 0}
              activeOpacity={0.7}
            >
              <Text style={styles.nextButtonText}>Next</Text>
              <ChevronRight size={20} color="#ffffff" strokeWidth={2} />
            </TouchableOpacity>


          </View>
        )}

        {selectedFloor && step === 'generate' && (
          <View style={styles.section}>
            <View style={styles.labelContainer}>
              <Hash
                size={18}
                color={theme.textSecondary}
                strokeWidth={2}
              />
              <Text style={[styles.label, { color: theme.text }]}>
                Starting room number
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
              placeholder="e.g., 001, 101, 201"
              placeholderTextColor={theme.textSecondary}
              value={startingRoomNumber}
              onChangeText={setStartingRoomNumber}
              keyboardType="default"
              autoFocus
            />

            <TouchableOpacity
              style={[
                styles.generateButton,
                {
                  backgroundColor: startingRoomNumber.trim()
                    ? theme.accent
                    : theme.inputBorder,
                },
              ]}
              onPress={handleGenerateRooms}
              disabled={!startingRoomNumber.trim()}
              activeOpacity={0.7}
            >
              <Text style={styles.generateButtonText}>
                Generate {roomCount} Rooms
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backLink}
              onPress={() => setStep('count')}
              activeOpacity={0.7}
            >
              <Text style={[styles.backLinkText, { color: theme.primary }]}>
                Back to room count
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {selectedFloor && step === 'assign' && generatedRooms.length > 0 && (
          <View style={styles.section}>
            <View style={styles.assignHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Assign Room Types ({generatedRooms.length} rooms)
              </Text>
              {allRoomsAssigned && (
                <View style={styles.completeIndicator}>
                  <CheckCircle size={20} color={theme.success} strokeWidth={2} />
                  <Text style={[styles.completeText, { color: theme.success }]}>
                    All assigned
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.assignHint, { color: theme.textSecondary }]}>
              Select a room type for each room
            </Text>

            <View style={styles.roomsList}>
              {generatedRooms.map((room) => (
                <RoomAssignmentCard
                  key={room.tempId}
                  roomNumber={room.roomNumber}
                  selectedType={roomAssignments[room.tempId] || null}
                  availableTypes={availableRoomTypes}
                  onPress={() => handleOpenAssignmentModal(room.tempId)}
                />
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.saveButton,
                {
                  backgroundColor: allRoomsAssigned
                    ? theme.accent
                    : theme.inputBorder,
                },
              ]}
              onPress={handleSaveRooms}
              disabled={!allRoomsAssigned}
              activeOpacity={0.7}
            >
              <Text style={styles.saveButtonText}>Save Rooms</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backLink}
              onPress={() => setStep('generate')}
              activeOpacity={0.7}
            >
              <Text style={[styles.backLinkText, { color: theme.primary }]}>
                Back to starting room number
              </Text>
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
                  onUpdate={() => {}}
                  onRemove={() => {
                    if (selectedBuildingId && selectedFloorId) {
                      removeRoom(selectedBuildingId, selectedFloorId, room.id);
                    }
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

      <RoomTypeSelectionModal
        visible={modalVisible}
        roomNumber={
          selectedRoomForAssignment
            ? generatedRooms.find((r) => r.tempId === selectedRoomForAssignment)?.roomNumber || ''
            : ''
        }
        availableTypes={availableRoomTypes}
        selectedType={
          selectedRoomForAssignment
            ? roomAssignments[selectedRoomForAssignment] || null
            : null
        }
        onSelect={handleAssignRoomType}
        onClose={() => setModalVisible(false)}
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
  warningCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  warningTextContainer: {
    flex: 1,
    gap: 4,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  warningText: {
    fontSize: 13,
    lineHeight: 18,
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
  nextButton: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  generateButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  backLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  backLinkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  assignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  completeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  assignHint: {
    fontSize: 14,
    lineHeight: 20,
  },
  roomsList: {
    gap: 12,
  },
  saveButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
