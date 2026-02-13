import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import WizardTopHeader from '@/components/WizardTopHeader';
import { Bed } from 'lucide-react-native';
import * as buildingService from '@/services/buildingService';
import * as floorService from '@/services/floorService';
import * as roomService from '@/services/roomService';
import * as bedService from '@/services/bedService';

export default function PropertyBedsScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id?: string }>();
    const [buildings, setBuildings] = useState<any[]>([]);
    const [expandedBuildingId, setExpandedBuildingId] = useState<string | null>(null);
    const [floorsByBuilding, setFloorsByBuilding] = useState<Record<string, any[]>>({});
    const [expandedFloorId, setExpandedFloorId] = useState<string | null>(null);
    const [roomsByFloor, setRoomsByFloor] = useState<Record<string, any[]>>({});
    const [expandedRoomId, setExpandedRoomId] = useState<string | null>(null);
    const [bedsByRoom, setBedsByRoom] = useState<Record<string, { beds: any[]; page: number; hasMore: boolean }>>({});
    const [loading, setLoading] = useState(false);
    const [loadingFloors, setLoadingFloors] = useState<string | null>(null);
    const [loadingRooms, setLoadingRooms] = useState<string | null>(null);
    const [loadingBeds, setLoadingBeds] = useState<string | null>(null);

    React.useEffect(() => {
        if (!id) return;
        loadBuildings();
    }, [id]);

    const loadBuildings = async () => {
        setLoading(true);
        const b = await buildingService.getBuildingSummaries(id as string);
        setBuildings(b);
        setLoading(false);
    };

    const handleExpandBuilding = async (buildingId: string) => {
        if (expandedBuildingId === buildingId) {
            setExpandedBuildingId(null);
            setExpandedFloorId(null);
            setExpandedRoomId(null);
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
        setExpandedRoomId(null);
    };

    const handleExpandFloor = async (floorId: string, buildingId: string) => {
        if (expandedFloorId === floorId) {
            setExpandedFloorId(null);
            setExpandedRoomId(null);
            return;
        }
        setExpandedFloorId(floorId);
        if (!roomsByFloor[floorId]) {
            setLoadingRooms(floorId);
            const rooms = await roomService.getRoomSummaries(id as string, buildingId, floorId);
            setRoomsByFloor((prev) => ({ ...prev, [floorId]: rooms }));
            setLoadingRooms(null);
        }
        setExpandedRoomId(null);
    };

    // Beds pagination
    const PAGE_SIZE = 20;
    const handleExpandRoom = async (roomId: string, buildingId: string, floorId: string) => {
        if (expandedRoomId === roomId) {
            setExpandedRoomId(null);
            return;
        }
        setExpandedRoomId(roomId);
        if (!bedsByRoom[roomId]) {
            setLoadingBeds(roomId);
            const beds = await bedService.getBedSummaries(id as string, buildingId, floorId, roomId);
            setBedsByRoom((prev) => ({
                ...prev,
                [roomId]: {
                    beds: beds.slice(0, PAGE_SIZE),
                    page: 1,
                    hasMore: beds.length > PAGE_SIZE,
                },
            }));
            setLoadingBeds(null);
        }
    };

    const handleLoadMoreBeds = async (roomId: string, buildingId: string, floorId: string) => {
        const current = bedsByRoom[roomId];
        if (!current) return;
        setLoadingBeds(roomId);
        const beds = await bedService.getBedSummaries(id as string, buildingId, floorId, roomId);
        const nextPage = current.page + 1;
        const nextBeds = beds.slice(0, nextPage * PAGE_SIZE);
        setBedsByRoom((prev) => ({
            ...prev,
            [roomId]: {
                beds: nextBeds,
                page: nextPage,
                hasMore: beds.length > nextPage * PAGE_SIZE,
            },
        }));
        setLoadingBeds(null);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}> 
            <WizardTopHeader title="Beds" onBack={() => router.back()} showMenu={false} />
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.headerRow}>
                    <Bed size={32} color={theme.primary} style={{ marginRight: 10 }} />
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Beds</Text>
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
                                                        ) : roomsByFloor[floor.id]?.length === 0 ? (
                                                            <Text style={{ color: theme.textSecondary, marginLeft: 32 }}>No rooms found.</Text>
                                                        ) : (
                                                            roomsByFloor[floor.id]?.map((room) => (
                                                                <View key={room.id} style={styles.roomSection}>
                                                                    <TouchableOpacity onPress={() => handleExpandRoom(room.id, building.id, floor.id)} activeOpacity={0.7}>
                                                                        <View style={styles.roomHeader}>
                                                                            <Text style={[styles.roomNumber, { color: theme.text }]}>{room.roomNumber}</Text>
                                                                            <Text style={{ color: theme.textSecondary, marginLeft: 8 }}>
                                                                                {expandedRoomId === room.id ? '▼' : '▶'}
                                                                            </Text>
                                                                        </View>
                                                                    </TouchableOpacity>
                                                                    {expandedRoomId === room.id && (
                                                                        <View>
                                                                            {loadingBeds === room.id ? (
                                                                                <Text style={{ color: theme.textSecondary, marginLeft: 40 }}>Loading beds...</Text>
                                                                            ) : !bedsByRoom[room.id] ? (
                                                                                <Text style={{ color: theme.textSecondary, marginLeft: 40 }}>No beds found.</Text>
                                                                            ) : bedsByRoom[room.id].beds.length === 0 ? (
                                                                                <Text style={{ color: theme.textSecondary, marginLeft: 40 }}>No beds found.</Text>
                                                                            ) : (
                                                                                <>
                                                                                    {bedsByRoom[room.id].beds.map((bed) => (
                                                                                        <View key={bed.id} style={styles.bedRow}>
                                                                                            <Bed size={18} color={bed.occupied ? theme.error : theme.success} style={{ marginRight: 8 }} />
                                                                                            <Text style={{ color: theme.text }}>{bed.id}</Text>
                                                                                            <Text style={{ color: bed.occupied ? theme.error : theme.success, marginLeft: 8 }}>
                                                                                                {bed.occupied ? 'Occupied' : 'Available'}
                                                                                            </Text>
                                                                                        </View>
                                                                                    ))}
                                                                                    {bedsByRoom[room.id].hasMore && (
                                                                                        <TouchableOpacity style={{ marginLeft: 40, marginTop: 8 }} onPress={() => handleLoadMoreBeds(room.id, building.id, floor.id)}>
                                                                                            <Text style={{ color: theme.primary, fontWeight: '600' }}>Load more beds</Text>
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
    roomSection: { marginBottom: 10, marginLeft: 16 },
    roomHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    roomNumber: { fontSize: 15, fontWeight: '600' },
    bedRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 24, marginBottom: 4 },
});
