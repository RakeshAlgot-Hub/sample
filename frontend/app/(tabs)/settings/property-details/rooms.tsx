import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import WizardTopHeader from '@/components/WizardTopHeader';
import { DoorOpen, Pencil, Trash2, Building2, Layers } from 'lucide-react-native';
import { getBuildingsByProperty, getFloorsByBuilding, getRoomsByFloor, saveRoom, getBedsByRoom } from '@/utils/propertyRepository';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PropertyRoomsScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id?: string }>();
    const [buildings, setBuildings] = useState<any[]>([]);
    const [floorsByBuilding, setFloorsByBuilding] = useState<Record<string, any[]>>({});
    const [roomsByFloor, setRoomsByFloor] = useState<Record<string, any[]>>({});
    const [editingId, setEditingId] = useState<string | null>(null);
    const [draftRoomNumber, setDraftRoomNumber] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!id) return;
        loadAll();
    }, [id]);

    const loadAll = async () => {
        setLoading(true);
        const b = await getBuildingsByProperty(id as string);
        setBuildings(b);
        const floorsObj: Record<string, any[]> = {};
        const roomsObj: Record<string, any[]> = {};
        for (const building of b) {
            const floors = await getFloorsByBuilding(building.id);
            floorsObj[building.id] = floors;
            for (const floor of floors) {
                roomsObj[floor.id] = await getRoomsByFloor(floor.id);
            }
        }
        setFloorsByBuilding(floorsObj);
        setRoomsByFloor(roomsObj);
        setLoading(false);
    };

    const handleEdit = (room: any) => {
        setEditingId(room.id);
        setDraftRoomNumber(room.roomNumber);
    };

    const handleSave = async (room: any) => {
        if (!draftRoomNumber.trim()) {
            Alert.alert('Room number required');
            return;
        }
        const updated = { ...room, roomNumber: draftRoomNumber.trim() };
        await saveRoom(updated);
        // Update all related beds if needed (if you store room number in them)
        setEditingId(null);
        setDraftRoomNumber('');
        await loadAll();
    };

    const handleDelete = async (room: any) => {
        Alert.alert('Delete Room', `Are you sure you want to delete room "${room.roomNumber}" and all its beds?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    const beds = await getBedsByRoom(room.id);
                    for (const bed of beds) {
                        await removeBed(bed.id);
                    }
                    await removeRoom(room.id);
                    await loadAll();
                }
            }
        ]);
    };

    // Placeholder remove functions (implement in propertyRepository as needed)
    const removeRoom = async (roomId: string) => {
        const data = await AsyncStorage.getItem('rooms_collection');
        const all = data ? JSON.parse(data) : [];
        const filtered = all.filter((r: any) => r.id !== roomId);
        await AsyncStorage.setItem('rooms_collection', JSON.stringify(filtered));
    };
    const removeBed = async (bedId: string) => {
        const data = await AsyncStorage.getItem('beds_collection');
        const all = data ? JSON.parse(data) : [];
        const filtered = all.filter((b: any) => b.id !== bedId);
        await AsyncStorage.setItem('beds_collection', JSON.stringify(filtered));
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}> 
            <WizardTopHeader title="Rooms" onBack={() => router.back()} showMenu={false} />
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.headerRow}>
                    <DoorOpen size={32} color={theme.primary} style={{ marginRight: 10 }} />
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Rooms</Text>
                </View>
                {loading ? (
                    <Text style={{ color: theme.textSecondary }}>Loading...</Text>
                ) : buildings.length === 0 ? (
                    <Text style={{ color: theme.textSecondary }}>No buildings found.</Text>
                ) : (
                    buildings.map((building) => (
                        <View key={building.id} style={styles.buildingSection}>
                            <View style={styles.buildingHeader}>
                                <Building2 size={20} color={theme.primary} style={{ marginRight: 6 }} />
                                <Text style={[styles.buildingName, { color: theme.text }]}>{building.name}</Text>
                            </View>
                            {floorsByBuilding[building.id]?.length === 0 ? (
                                <Text style={{ color: theme.textSecondary, marginLeft: 24 }}>No floors found.</Text>
                            ) : (
                                floorsByBuilding[building.id]?.map((floor) => (
                                    <View key={floor.id} style={styles.floorSection}>
                                        <View style={styles.floorHeader}>
                                            <Layers size={16} color={theme.primary} style={{ marginRight: 4 }} />
                                            <Text style={[styles.floorLabel, { color: theme.text }]}>{floor.label}</Text>
                                        </View>
                                        {roomsByFloor[floor.id]?.length === 0 ? (
                                            <Text style={{ color: theme.textSecondary, marginLeft: 32 }}>No rooms found.</Text>
                                        ) : (
                                            roomsByFloor[floor.id]?.map((room) => (
                                                <View key={room.id} style={[styles.roomCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}> 
                                                    <View style={styles.roomRow}>
                                                        <DoorOpen size={18} color={theme.primary} style={{ marginRight: 8 }} />
                                                        {editingId === room.id ? (
                                                            <TextInput
                                                                style={[styles.input, { color: theme.text, borderColor: theme.primary }]}
                                                                value={draftRoomNumber}
                                                                onChangeText={setDraftRoomNumber}
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <Text style={[styles.roomNumber, { color: theme.text }]}>{room.roomNumber}</Text>
                                                        )}
                                                        <View style={styles.actions}>
                                                            {editingId === room.id ? (
                                                                <TouchableOpacity style={styles.saveBtn} onPress={() => handleSave(room)}>
                                                                    <Text style={styles.saveBtnText}>Save</Text>
                                                                </TouchableOpacity>
                                                            ) : (
                                                                <>
                                                                    <TouchableOpacity style={styles.iconBtn} onPress={() => handleEdit(room)}>
                                                                        <Pencil size={16} color={theme.textSecondary} />
                                                                    </TouchableOpacity>
                                                                    <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(room)}>
                                                                        <Trash2 size={16} color={theme.error} />
                                                                    </TouchableOpacity>
                                                                </>
                                                            )}
                                                        </View>
                                                    </View>
                                                </View>
                                            ))
                                        )}
                                    </View>
                                ))
                            )}
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 16, gap: 18 },
    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
    headerTitle: { fontSize: 22, fontWeight: '700' },
    buildingSection: { marginBottom: 24 },
    buildingHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    buildingName: { fontSize: 16, fontWeight: '700' },
    floorSection: { marginBottom: 16, marginLeft: 16 },
    floorHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    floorLabel: { fontSize: 15, fontWeight: '600' },
    roomCard: { borderWidth: 1, borderRadius: 14, marginBottom: 10, padding: 12, marginLeft: 16 },
    roomRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    roomNumber: { fontSize: 15, fontWeight: '600', flex: 1 },
    input: { flex: 1, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, fontSize: 15, fontWeight: '600', marginRight: 8 },
    actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    iconBtn: { padding: 6, borderRadius: 8 },
    saveBtn: { backgroundColor: '#4ECDC4', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
    saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
