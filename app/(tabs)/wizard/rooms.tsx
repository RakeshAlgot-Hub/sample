import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
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
import { RoomType } from '@/components/RoomTypeSelector';
import EditableRoomCard from '@/components/EditableRoomCard';
import { Plus, ChevronDown } from 'lucide-react-native';

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
    editingPropertyId,
  } = useWizardStore();

  const availableRoomTypes: RoomType[] = useMemo(() => {
    const types: RoomType[] = allowedBedCounts.map(count => {
      let label = `${count} Bed`;
      if (count > 1) label += 's';
      let id: RoomType['id'];

      if (count === 1) id = 'single';
      else if (count === 2) id = 'double';
      else if (count === 3) id = 'triple';
      else id = `custom-${count}`;

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
  const [buildingExpanded, setBuildingExpanded] = useState(false);
  const [floorExpanded, setFloorExpanded] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{
    buildingId: string;
    floorId: string;
    roomId: string;
  } | null>(null);
  const [validationError, setValidationError] = useState<{
    buildingId: string;
    floorId: string;
    floorLabel: string;
    buildingName: string;
  } | null>(null);
  const [duplicateRoomError, setDuplicateRoomError] = useState<string>('');

  useEffect(() => {
    if (buildings.length === 0) return;

    const selectedExists = buildings.some((b) => b.id === selectedBuildingId);
    const nextBuildingId = !selectedBuildingId || !selectedExists
      ? buildings[0].id
      : selectedBuildingId;

    if (nextBuildingId !== selectedBuildingId) {
      setSelectedBuildingId(nextBuildingId);
    }

    const building = buildings.find((b) => b.id === nextBuildingId);
    if (!building || building.floors.length === 0) {
      if (selectedFloorId) setSelectedFloorId('');
      return;
    }

    const floorExists = building.floors.some((f) => f.id === selectedFloorId);
    if (!selectedFloorId || !floorExists) setSelectedFloorId(building.floors[0].id);
  }, [buildings, selectedBuildingId, selectedFloorId]);

  const selectedBuilding = buildings.find((b) => b.id === selectedBuildingId);
  const selectedFloor = selectedBuilding?.floors.find((f) => f.id === selectedFloorId);
  const existingRooms = selectedFloor?.rooms || [];
  const hasBuildings = buildings.length > 0;
  const hasFloors = !!selectedBuilding && selectedBuilding.floors.length > 0;
  const hasRoomTypes = availableRoomTypes.length > 0;

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

  const handleBuildingChange = (buildingId: string) => {
    setSelectedBuildingId(buildingId);
    const building = buildings.find((b) => b.id === buildingId);
    if (building && building.floors.length > 0) {
      setSelectedFloorId(building.floors[0].id);
    }
  };

  const handleFloorChange = (floorId: string) => {
    setSelectedFloorId(floorId);
  };

  const handleAddRoom = () => {
    if (!selectedBuildingId || !selectedFloorId || !roomNumber.trim() || !selectedRoomType) {
      return;
    }

    // Check if room number already exists in any building/floor
    const roomExists = buildings.some(building =>
      building.floors.some(floor =>
        floor.rooms?.some(room => room.roomNumber === roomNumber.trim())
      )
    );

    if (roomExists) {
      setDuplicateRoomError(`Room number ${roomNumber.trim()} already exists in this property`);
      return;
    }

    setDuplicateRoomError('');
    const shareType = selectedRoomType.bedCount === 1 ? 'single' : selectedRoomType.bedCount === 2 ? 'double' : 'triple';
    addRoom(selectedBuildingId, selectedFloorId, {
      id: Date.now().toString() + Math.random(),
      roomNumber: roomNumber.trim(),
      shareType,
      bedCount: selectedRoomType.bedCount,
      beds: [],
    });

    setRoomNumber('');
    setSelectedRoomType(null);
  };

  const findFirstEmptyFloor = useCallback(() => {
    for (const building of buildings) {
      for (const floor of building.floors) {
        if (!floor.rooms || floor.rooms.length === 0) {
          return { buildingId: building.id, floorId: floor.id, floorLabel: floor.label, buildingName: building.name };
        }
      }
    }
    return null;
  }, [buildings]);

  const handleConfirmContinueToReview = useCallback(() => {
    setValidationError(null);
    nextStep();
    router.push('/wizard/review');
  }, [nextStep, router]);

  const handleNext = () => {
    const emptyFloor = findFirstEmptyFloor();
    
    if (emptyFloor) {
      setValidationError(emptyFloor);
      return;
    }

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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <WizardTopHeader onBack={handleBack} title="Rooms" rightAction="close" onClose={handleClose} />
      <WizardHeader
        currentStep={5}
        totalSteps={6}
        title="Rooms"
        onClose={handleClose}
        showClose={false}
        showSteps
        showTitle={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {hasBuildings && hasFloors && selectedBuilding && selectedFloor && (
          <>
            {/* Building Selection */}
            <View>
              <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Building</Text>
              {buildings.length > 1 ? (
                <TouchableOpacity
                  style={[styles.selectorBtn, { backgroundColor: theme.primary, borderColor: theme.primary }]}
                  onPress={() => setBuildingExpanded(!buildingExpanded)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.selectorBtnText}>{selectedBuilding.name}</Text>
                  <ChevronDown size={20} color="#fff" strokeWidth={2.5} />
                </TouchableOpacity>
              ) : (
                <View style={[styles.selectorBtn, { backgroundColor: theme.inputBackground, borderColor: theme.cardBorder }]}>
                  <Text style={[styles.selectorBtnText, { color: theme.text }]}>{selectedBuilding.name}</Text>
                </View>
              )}
              {buildingExpanded && buildings.length > 1 && (
                <View style={[styles.expandedList, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                  {buildings.map((b) => (
                    <TouchableOpacity
                      key={b.id}
                      style={[styles.expandedItem, { borderBottomColor: theme.cardBorder }]}
                      onPress={() => {
                        handleBuildingChange(b.id);
                        setBuildingExpanded(false);
                      }}
                      activeOpacity={0.6}
                    >
                      <Text style={[styles.expandedItemText, { color: b.id === selectedBuildingId ? theme.primary : theme.text }]}>
                        {b.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Floor Selection */}
            <View>
              <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Floor</Text>
              {selectedBuilding.floors.length > 1 ? (
                <TouchableOpacity
                  style={[styles.selectorBtn, { backgroundColor: theme.accent, borderColor: theme.accent }]}
                  onPress={() => setFloorExpanded(!floorExpanded)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.selectorBtnText}>Floor {selectedFloor.label}</Text>
                  <ChevronDown size={20} color="#fff" strokeWidth={2.5} />
                </TouchableOpacity>
              ) : (
                <View style={[styles.selectorBtn, { backgroundColor: theme.inputBackground, borderColor: theme.cardBorder }]}>
                  <Text style={[styles.selectorBtnText, { color: theme.text }]}>Floor {selectedFloor.label}</Text>
                </View>
              )}
              {floorExpanded && selectedBuilding.floors.length > 1 && (
                <View style={[styles.expandedList, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                  {selectedBuilding.floors.map((f) => (
                    <TouchableOpacity
                      key={f.id}
                      style={[styles.expandedItem, { borderBottomColor: theme.cardBorder }]}
                      onPress={() => {
                        handleFloorChange(f.id);
                        setFloorExpanded(false);
                      }}
                      activeOpacity={0.6}
                    >
                      <Text style={[styles.expandedItemText, { color: f.id === selectedFloorId ? theme.accent : theme.text }]}>
                        Floor {f.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Room Number Input */}
            <View>
              <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Room Number</Text>
              <TextInput
                style={[
                  styles.largeInput,
                  {
                    backgroundColor: theme.inputBackground,
                    borderColor: duplicateRoomError ? theme.error : roomNumber.trim() ? theme.primary : theme.inputBorder,
                    color: theme.text,
                  },
                ]}
                placeholder="e.g., 101"
                placeholderTextColor={theme.textSecondary}
                value={roomNumber}
                onChangeText={(text) => {
                  setRoomNumber(text);
                  if (duplicateRoomError) setDuplicateRoomError('');
                }}
                maxLength={10}
              />
              {duplicateRoomError && (
                <Text style={[styles.errorText, { color: theme.error }]}>{duplicateRoomError}</Text>
              )}
            </View>

            {/* Bed Type Selection */}
            {hasRoomTypes && (
              <View>
                <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>How many beds?</Text>
                <View style={styles.bedTypeGrid}>
                  {availableRoomTypes.map((type) => {
                    const isSelected = selectedRoomType?.id === type.id;
                    return (
                      <TouchableOpacity
                        key={type.id}
                        style={[
                          styles.bedTypeBtn,
                          {
                            backgroundColor: isSelected ? theme.primary : theme.inputBackground,
                            borderColor: isSelected ? theme.primary : theme.cardBorder,
                          },
                        ]}
                        onPress={() => setSelectedRoomType(type)}
                        activeOpacity={0.6}
                      >
                        <Text style={[styles.bedNumber, { color: isSelected ? '#fff' : theme.primary }]}>
                          {type.bedCount}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Create Room Button */}
            <TouchableOpacity
              style={[
                styles.createRoomBtn,
                {
                  backgroundColor: roomNumber.trim() && selectedRoomType && !duplicateRoomError ? theme.primary : theme.inputBorder,
                },
              ]}
              onPress={handleAddRoom}
              disabled={!roomNumber.trim() || !selectedRoomType || !!duplicateRoomError}
              activeOpacity={0.7}
            >
              <Plus size={22} color="#ffffff" strokeWidth={2.5} />
              <Text style={styles.createRoomBtnText}>Create Room</Text>
            </TouchableOpacity>

            {/* Rooms List */}
            {existingRooms.length > 0 && (
              <View>
                <Text style={[styles.listTitle, { color: theme.text }]}>
                  Created ({existingRooms.length})
                </Text>
                <View style={styles.roomsList}>
                  {existingRooms.map((room) => (
                    <EditableRoomCard
                      key={room.id}
                      roomNumber={room.roomNumber}
                      shareType={room.shareType}
                      bedCount={room.bedCount ?? room.beds.length}
                      onUpdate={() => {}}
                      onRemove={() => handleRemoveRoom(room.id)}
                    />
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <WizardFooter onBack={handleBack} onNext={handleNext} nextLabel="Next" nextDisabled={!canProceed} showBack={false} />

      <ConfirmModal
        visible={validationError !== null}
        title="Rooms Not Created"
        message={validationError ? `You haven't created any room in Floor ${validationError.floorLabel} of ${validationError.buildingName}. Continue to review and save?` : ''}
        onCancel={() => setValidationError(null)}
        onConfirm={handleConfirmContinueToReview}
        confirmLabel="Continue"
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
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100, gap: 20 },
  sectionLabel: { fontSize: 13, fontWeight: '600', marginBottom: 10, textTransform: 'uppercase' },
  selectorBtn: { height: 54, borderRadius: 12, borderWidth: 1.5, justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, flexDirection: 'row' },
  selectorBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  expandedList: { marginTop: 8, borderRadius: 10, borderWidth: 1, overflow: 'hidden' },
  expandedItem: { paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1 },
  expandedItemText: { fontSize: 15, fontWeight: '600' },
  largeInput: { height: 54, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 16, fontSize: 18, fontWeight: '600' },
  errorText: { fontSize: 12, fontWeight: '600', marginTop: 6 },
  bedTypeGrid: { flexDirection: 'row', gap: 12 },
  bedTypeBtn: { flex: 1, height: 70, borderRadius: 12, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  bedNumber: { fontSize: 28, fontWeight: '800' },
  createRoomBtn: { height: 56, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 8, marginBottom: 12 },
  createRoomBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  listTitle: { fontSize: 13, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase' },
  roomsList: { gap: 10 },
});
