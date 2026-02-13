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
import * as buildingService from '@/services/buildingService';
import * as floorService from '@/services/floorService';
import * as roomService from '@/services/roomService';

export default function PropertyRoomsScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id?: string }>();
    const [buildings, setBuildings] = useState<any[]>([]);
    const [expandedBuildingId, setExpandedBuildingId] = useState<string | null>(null);
    const [floorsByBuilding, setFloorsByBuilding] = useState<Record<string, any[]>>({});
    const [expandedFloorId, setExpandedFloorId] = useState<string | null>(null);
    const [roomsByFloor, setRoomsByFloor] = useState<Record<string, { rooms: any[]; page: number; hasMore: boolean }>>({});
    const [editingId, setEditingId] = useState<string | null>(null);
    const [draftRoomNumber, setDraftRoomNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingFloors, setLoadingFloors] = useState<string | null>(null);
    const [loadingRooms, setLoadingRooms] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        loadBuildings();
    }, [id]);

    // Only load building summaries on open
    const loadBuildings = async () => {
        setLoading(true);
        const b = await buildingService.getBuildingSummaries(id as string);
        setBuildings(b);
        setLoading(false);
    };

    // Load floors for a building only when expanded
    const handleExpandBuilding = async (buildingId: string) => {
        if (expandedBuildingId === buildingId) {
            setExpandedBuildingId(null);
            setExpandedFloorId(null);
            return;
        }
        setExpandedBuildingId(buildingId);
        if (!floorsByBuilding[buildingId]) {
            setLoadingFloors(buildingId);
            const floors = await floorService.getFloorSummaries(id as string, buildingId);
            setFloorsByBuilding((prev) => ({ ...prev, [buildingId]: floors }));
            setLoadingFloors(null);
        }
        setExpandedFloorId(null);
    };

    // Load rooms for a floor only when expanded, with pagination
    const PAGE_SIZE = 20;
    const handleExpandFloor = async (floorId: string, buildingId: string) => {
        if (expandedFloorId === floorId) {
            setExpandedFloorId(null);
            return;
        }
        setExpandedFloorId(floorId);
        if (!roomsByFloor[floorId]) {
            setLoadingRooms(floorId);
            const rooms = await roomService.getRoomSummaries(id as string, buildingId, floorId);
            // Simulate pagination: slice to PAGE_SIZE, set hasMore
            setRoomsByFloor((prev) => ({
                ...prev,
                [floorId]: {
                    rooms: rooms.slice(0, PAGE_SIZE),
                    page: 1,
                    hasMore: rooms.length > PAGE_SIZE,
                },
            }));
            setLoadingRooms(null);
        }
    };

    // Load more rooms for a floor (pagination)
    const handleLoadMoreRooms = async (floorId: string, buildingId: string) => {
        const current = roomsByFloor[floorId];
        if (!current) return;
        setLoadingRooms(floorId);
        const rooms = await roomService.getRoomSummaries(id as string, buildingId, floorId);
        const nextPage = current.page + 1;
        const nextRooms = rooms.slice(0, nextPage * PAGE_SIZE);
        setRoomsByFloor((prev) => ({
            ...prev,
            [floorId]: {
                rooms: nextRooms,
                page: nextPage,
                hasMore: rooms.length > nextPage * PAGE_SIZE,
            },
        }));
        setLoadingRooms(null);
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
        await roomService.updateRoom(room.propertyId, room.buildingId, room.floorId, room.id, { name: draftRoomNumber.trim() });
        setEditingId(null);
        setDraftRoomNumber('');
        // Reload rooms for this floor only
        if (expandedFloorId && expandedBuildingId) {
            setLoadingRooms(expandedFloorId);
            const rooms = await roomService.getRoomSummaries(id as string, expandedBuildingId, expandedFloorId);
            setRoomsByFloor((prev) => ({
                ...prev,
                [expandedFloorId]: {
                    rooms: rooms.slice(0, PAGE_SIZE),
                    page: 1,
                    hasMore: rooms.length > PAGE_SIZE,
                },
            }));
            setLoadingRooms(null);
        }
    };

    const handleDelete = async (room: any) => {
        Alert.alert('Delete Room', `Are you sure you want to delete room "${room.roomNumber}" and all its beds?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    // Backend is responsible for cascading deletes
                    await roomService.deleteRoom(room.propertyId, room.buildingId, room.floorId, room.id);
                    // Reload rooms for this floor only
                    if (expandedFloorId && expandedBuildingId) {
                        setLoadingRooms(expandedFloorId);
                        const rooms = await roomService.getRoomSummaries(id as string, expandedBuildingId, expandedFloorId);
                        setRoomsByFloor((prev) => ({
                            ...prev,
                            [expandedFloorId]: {
                                rooms: rooms.slice(0, PAGE_SIZE),
                                page: 1,
                                hasMore: rooms.length > PAGE_SIZE,
                            },
                        }));
                        setLoadingRooms(null);
                    }
                }
            }
        ]);
    };

    // No local hierarchy or totals, backend handles all cascade and summary counts.

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
                            <TouchableOpacity onPress={() => handleExpandBuilding(building.id)} activeOpacity={0.7}>
                                <View style={styles.buildingHeader}>
                                    <Building2 size={20} color={theme.primary} style={{ marginRight: 6 }} />
                                    <Text style={[styles.buildingName, { color: theme.text }]}>{building.name}</Text>
                                    <Text style={{ color: theme.textSecondary, marginLeft: 8 }}>
                                        {expandedBuildingId === building.id ? '▼' : '▶'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            {expandedBuildingId === building.id && (
                                <View>
                                    {loadingFloors === building.id ? (
                                        <Text style={{ color: theme.textSecondary, marginLeft: 24 }}>Loading floors...</Text>
                                    ) : floorsByBuilding[building.id]?.length === 0 ? (
                                        <Text style={{ color: theme.textSecondary, marginLeft: 24 }}>No floors found.</Text>
                                    ) : (
                                        floorsByBuilding[building.id]?.map((floor) => (
                                            <View key={floor.id} style={styles.floorSection}>
                                                <TouchableOpacity onPress={() => handleExpandFloor(floor.id, building.id)} activeOpacity={0.7}>
                                                    <View style={styles.floorHeader}>
                                                        <Layers size={16} color={theme.primary} style={{ marginRight: 4 }} />
                                                        <Text style={[styles.floorLabel, { color: theme.text }]}>{floor.label}</Text>
                                                        <Text style={{ color: theme.textSecondary, marginLeft: 8 }}>
                                                            {expandedFloorId === floor.id ? '▼' : '▶'}
                                                        </Text>
                                                    </View>
                                                </TouchableOpacity>
                                                {expandedFloorId === floor.id && (
                                                    <View>
                                                        {loadingRooms === floor.id ? (
                                                            <Text style={{ color: theme.textSecondary, marginLeft: 32 }}>Loading rooms...</Text>
                                                        ) : !roomsByFloor[floor.id] ? (
                                                            <Text style={{ color: theme.textSecondary, marginLeft: 32 }}>No rooms found.</Text>
                                                        ) : roomsByFloor[floor.id].rooms.length === 0 ? (
                                                            <Text style={{ color: theme.textSecondary, marginLeft: 32 }}>No rooms found.</Text>
                                                        ) : (
                                                            <>
                                                                {roomsByFloor[floor.id].rooms.map((room) => (
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
                                                                ))}
                                                                {roomsByFloor[floor.id].hasMore && (
                                                                    <TouchableOpacity style={{ marginLeft: 32, marginTop: 8 }} onPress={() => handleLoadMoreRooms(floor.id, building.id)}>
                                                                        <Text style={{ color: theme.primary, fontWeight: '600' }}>Load more rooms</Text>
                                                                    </TouchableOpacity>
                                                                )}
                                                            </>
                                                        )}
                                                    </View>
                                                )}
                                            </View>
                                        ))
                                    )}
                                </View>
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
