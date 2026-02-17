import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { usePropertiesStore } from '@/store/usePropertiesStore';
import { Plus } from 'lucide-react-native';
import * as roomService from '@/services/roomService';
import ManageHeader from '@/components/ManageHeader';
import { useRouter } from 'expo-router';
import AddRoomModal from '@/components/AddRoomModal';
// Removed propertyService import

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    borderBottomWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 2,
  },
  headerBackBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBackText: {
    fontSize: 22,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
  },
  headerRightSpace: {
    width: 40,
    height: 40,
  },
  content: { padding: 16, gap: 18 },
  emptyState: { alignItems: 'center', marginTop: 48 },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4ECDC4', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8, marginTop: 8 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 16, marginLeft: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', borderRadius: 16, padding: 20, elevation: 4 },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, fontSize: 15, fontWeight: '600', marginBottom: 12, height: 44 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 4, marginTop: 8 },
  dropdown: { maxHeight: 100, marginBottom: 8 },
  dropdownItem: { paddingVertical: 8, paddingHorizontal: 6 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12 },
  cancelBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee' },
  saveBtn: { backgroundColor: '#4ECDC4', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

export default function PropertyRoomsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const handleBack = () => router.replace('/properties');
  const backPressedRef = useRef(false);
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string | undefined>(id);
  const { properties, activePropertyId } = usePropertiesStore();
  const [addRoomVisible, setAddRoomVisible] = useState(false);
  const [savingRoom, setSavingRoom] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedProperty) return;
    loadRooms();
  }, [selectedProperty]);

  // Removed loadProperty, use store
  const loadRooms = async () => {
    setLoading(true);
    try {
      // Fetch rooms for the selected property
      const fetchedRooms = await roomService.getRoomsByProperty(selectedProperty!);
      setRooms(Array.isArray(fetchedRooms) ? fetchedRooms : []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load rooms');
      setRooms([]);
    }
    setLoading(false);
  };

  const handleAddRoom = async (roomData: any) => {
    setSavingRoom(true);
    setError('');
    try {
      // Add room
      const newRoom = await roomService.createRoom({
        propertyId: selectedProperty!,
        roomNumber: roomData.roomNumber,
        buildingName: roomData.buildingName,
        floorName: roomData.floorName,
        shareType: roomData.shareType,
      });
      // If "Other" was used, update property in store
      if (roomData.isOtherFloor || roomData.isOtherShareType) {
        const updatePayload: any = {};
        const prop = properties.find((p) => p.id === selectedProperty);
        if (roomData.isOtherFloor) {
          updatePayload.floors = [...(prop?.floors || []), roomData.floorName];
        }
        if (roomData.isOtherShareType) {
          updatePayload.shareTypes = [...(prop?.shareTypes || []), roomData.shareType];
        }
        // Use store updateProperty
        await usePropertiesStore.getState().updateProperty(selectedProperty!, updatePayload);
      }
      setRooms((prev: any[]) => [...prev, newRoom]);
      setAddRoomVisible(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to add room');
    }
    setSavingRoom(false);
  };

  // Group rooms by building and floor
  const groupedRooms = React.useMemo(() => {
    const groups: any = {};
    rooms.forEach((room: any) => {
      if (!groups[room.buildingName]) groups[room.buildingName] = {};
      if (!groups[room.buildingName][room.floorName]) groups[room.buildingName][room.floorName] = [];
      groups[room.buildingName][room.floorName].push(room);
    });
    return groups;
  }, [rooms]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}> 
      <ManageHeader title="Rooms" onBack={handleBack} />
      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <Text style={{ color: theme.textSecondary }}>Loading...</Text>
        ) : rooms.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{ color: theme.textSecondary, marginBottom: 16 }}>No rooms found.</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setAddRoomVisible(true)}>
              <Plus size={20} color="#fff" />
              <Text style={styles.addBtnText}>Add Room</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity style={styles.addBtn} onPress={() => setAddRoomVisible(true)}>
              <Plus size={20} color="#fff" />
              <Text style={styles.addBtnText}>Add Room</Text>
            </TouchableOpacity>
            {/* Grouped room display */}
            {Object.keys(groupedRooms).map(building => (
              <View key={building} style={{ marginTop: 18 }}>
                <Text style={{ fontWeight: '700', fontSize: 16, marginBottom: 6 }}>{building}</Text>
                {Object.keys(groupedRooms[building]).map(floor => (
                  <View key={floor} style={{ marginLeft: 12, marginBottom: 8 }}>
                    <Text style={{ fontWeight: '600', fontSize: 14, marginBottom: 4 }}>Floor: {floor}</Text>
                    {groupedRooms[building][floor].map((room: any) => (
                      <View key={room.id} style={{ padding: 10, borderWidth: 1, borderRadius: 8, marginBottom: 6, borderColor: theme.border }}>
                        <Text style={{ fontWeight: '600', color: theme.text }}>Room: {room.roomNumber}</Text>
                        <Text style={{ color: theme.textSecondary }}>ShareType: {room.shareType}</Text>
                        {/* Edit/Delete buttons can be added here */}
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            ))}
          </>
        )}
        {error ? <Text style={{ color: '#E74C3C', marginTop: 8 }}>{error}</Text> : null}
      </ScrollView>
      {activePropertyId && properties.length > 0 && (
        (() => {
          const prop = properties.find((p) => p.id === selectedProperty);
          if (!prop) return null;
          return (
            <AddRoomModal
              visible={addRoomVisible}
              onClose={() => setAddRoomVisible(false)}
              onSave={handleAddRoom}
              property={{
                buildings: (prop.buildings || []).map((name: string) => ({ name, floors: prop.floors || [] })),
                shareTypes: prop.shareTypes || [],
              }}
              existingRooms={Array.isArray(rooms) ? rooms.map((r: any) => ({ roomNumber: r.roomNumber, buildingName: r.buildingName, floorName: r.floorName })) : []}
            />
          );
        })()
      )}
    </SafeAreaView>
  );
}
