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
import { Layers, Pencil, Trash2, Building2 } from 'lucide-react-native';
import { getBuildingsByProperty, getFloorsByBuilding, saveFloor, getRoomsByFloor, getBedsByRoom } from '@/utils/propertyRepository';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PropertyFloorsScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id?: string }>();
    const [buildings, setBuildings] = useState<any[]>([]);
    const [floorsByBuilding, setFloorsByBuilding] = useState<Record<string, any[]>>({});
    const [editingId, setEditingId] = useState<string | null>(null);
    const [draftLabel, setDraftLabel] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!id) return;
        loadBuildingsAndFloors();
    }, [id]);

    const loadBuildingsAndFloors = async () => {
        setLoading(true);
        const b = await getBuildingsByProperty(id as string);
        setBuildings(b);
        const floorsObj: Record<string, any[]> = {};
        for (const building of b) {
            floorsObj[building.id] = await getFloorsByBuilding(building.id);
        }
        setFloorsByBuilding(floorsObj);
        setLoading(false);
    };

    const handleEdit = (floor: any) => {
        setEditingId(floor.id);
        setDraftLabel(floor.label);
    };

    const handleSave = async (floor: any) => {
        if (!draftLabel.trim()) {
            Alert.alert('Floor label required');
            return;
        }
        const updated = { ...floor, label: draftLabel.trim() };
        await saveFloor(updated);
        // Update all related rooms, beds if needed (if you store floor label in them)
        setEditingId(null);
        setDraftLabel('');
        await loadBuildingsAndFloors();
    };

    const handleDelete = async (floor: any) => {
        Alert.alert('Delete Floor', `Are you sure you want to delete "${floor.label}" and all its rooms and beds?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    // Remove all related rooms, beds
                    const rooms = await getRoomsByFloor(floor.id);
                    for (const room of rooms) {
                        const beds = await getBedsByRoom(room.id);
                        for (const bed of beds) {
                            await removeBed(bed.id);
                        }
                        await removeRoom(room.id);
                    }
                    await removeFloor(floor.id);
                    await loadBuildingsAndFloors();
                }
            }
        ]);
    };

    // Placeholder remove functions (implement in propertyRepository as needed)
    const removeFloor = async (floorId: string) => {
        const data = await AsyncStorage.getItem('floors_collection');
        const all = data ? JSON.parse(data) : [];
        const filtered = all.filter((f: any) => f.id !== floorId);
        await AsyncStorage.setItem('floors_collection', JSON.stringify(filtered));
    };
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
            <WizardTopHeader title="Floors" onBack={() => router.back()} showMenu={false} />
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.headerRow}>
                    <Layers size={32} color={theme.primary} style={{ marginRight: 10 }} />
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Floors</Text>
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
                                    <View key={floor.id} style={[styles.floorCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}> 
                                        <View style={styles.floorRow}>
                                            <Layers size={18} color={theme.primary} style={{ marginRight: 8 }} />
                                            {editingId === floor.id ? (
                                                <TextInput
                                                    style={[styles.input, { color: theme.text, borderColor: theme.primary }]}
                                                    value={draftLabel}
                                                    onChangeText={setDraftLabel}
                                                    autoFocus
                                                />
                                            ) : (
                                                <Text style={[styles.floorLabel, { color: theme.text }]}>{floor.label}</Text>
                                            )}
                                            <View style={styles.actions}>
                                                {editingId === floor.id ? (
                                                    <TouchableOpacity style={styles.saveBtn} onPress={() => handleSave(floor)}>
                                                        <Text style={styles.saveBtnText}>Save</Text>
                                                    </TouchableOpacity>
                                                ) : (
                                                    <>
                                                        <TouchableOpacity style={styles.iconBtn} onPress={() => handleEdit(floor)}>
                                                            <Pencil size={16} color={theme.textSecondary} />
                                                        </TouchableOpacity>
                                                        <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(floor)}>
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
    floorCard: { borderWidth: 1, borderRadius: 14, marginBottom: 12, padding: 12 },
    floorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    floorLabel: { fontSize: 15, fontWeight: '600', flex: 1 },
    input: { flex: 1, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, fontSize: 15, fontWeight: '600', marginRight: 8 },
    actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    iconBtn: { padding: 6, borderRadius: 8 },
    saveBtn: { backgroundColor: '#4ECDC4', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
    saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
