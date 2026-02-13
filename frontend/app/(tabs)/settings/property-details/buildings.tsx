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
import { Building2, Pencil, Trash2 } from 'lucide-react-native';
import { getBuildingsByProperty, saveBuilding, getFloorsByBuilding, getRoomsByFloor, getBedsByRoom } from '@/utils/propertyRepository';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PropertyBuildingsScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { id, source } = useLocalSearchParams<{ id?: string; source?: string }>();
    const [buildings, setBuildings] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [draftName, setDraftName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!id) return;
        loadBuildings();
    }, [id]);

    const loadBuildings = async () => {
        setLoading(true);
        const b = await getBuildingsByProperty(id as string);
        setBuildings(b);
        setLoading(false);
    };

    const handleEdit = (building: any) => {
        setEditingId(building.id);
        setDraftName(building.name);
    };

    const handleSave = async (building: any) => {
        if (!draftName.trim()) {
            Alert.alert('Building name required');
            return;
        }
        const updated = { ...building, name: draftName.trim() };
        await saveBuilding(updated);
        // Update all related floors, rooms, beds if needed (if you store building name in them)
        setEditingId(null);
        setDraftName('');
        await loadBuildings();
    };

    const handleDelete = async (building: any) => {
        Alert.alert('Delete Building', `Are you sure you want to delete "${building.name}" and all its floors, rooms, and beds?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    // Remove all related floors, rooms, beds
                    const floors = await getFloorsByBuilding(building.id);
                    for (const floor of floors) {
                        const rooms = await getRoomsByFloor(floor.id);
                        for (const room of rooms) {
                            const beds = await getBedsByRoom(room.id);
                            // Remove beds
                            for (const bed of beds) {
                                await removeBed(bed.id);
                            }
                            await removeRoom(room.id);
                        }
                        await removeFloor(floor.id);
                    }
                    await removeBuilding(building.id);
                    await loadBuildings();
                }
            }
        ]);
    };

    // Placeholder remove functions (implement in propertyRepository as needed)
    const removeBuilding = async (buildingId: string) => {
        const data = await AsyncStorage.getItem('buildings_collection');
        const all = data ? JSON.parse(data) : [];
        const filtered = all.filter((b: any) => b.id !== buildingId);
        await AsyncStorage.setItem('buildings_collection', JSON.stringify(filtered));
    };
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
            <WizardTopHeader title="Buildings" onBack={() => router.back()} showMenu={false} />
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.headerRow}>
                    <Building2 size={32} color={theme.primary} style={{ marginRight: 10 }} />
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Buildings</Text>
                </View>
                {loading ? (
                    <Text style={{ color: theme.textSecondary }}>Loading...</Text>
                ) : buildings.length === 0 ? (
                    <Text style={{ color: theme.textSecondary }}>No buildings found.</Text>
                ) : (
                    buildings.map((building) => (
                        <View key={building.id} style={[styles.buildingCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}> 
                            <View style={styles.buildingRow}>
                                <Building2 size={22} color={theme.primary} style={{ marginRight: 8 }} />
                                {editingId === building.id ? (
                                    <TextInput
                                        style={[styles.input, { color: theme.text, borderColor: theme.primary }]}
                                        value={draftName}
                                        onChangeText={setDraftName}
                                        autoFocus
                                    />
                                ) : (
                                    <Text style={[styles.buildingName, { color: theme.text }]}>{building.name}</Text>
                                )}
                                <View style={styles.actions}>
                                    {editingId === building.id ? (
                                        <TouchableOpacity style={styles.saveBtn} onPress={() => handleSave(building)}>
                                            <Text style={styles.saveBtnText}>Save</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <>
                                            <TouchableOpacity style={styles.iconBtn} onPress={() => handleEdit(building)}>
                                                <Pencil size={16} color={theme.textSecondary} />
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(building)}>
                                                <Trash2 size={16} color={theme.error} />
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </View>
                            </View>
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
    buildingCard: { borderWidth: 1, borderRadius: 14, marginBottom: 14, padding: 14 },
    buildingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    buildingName: { fontSize: 16, fontWeight: '600', flex: 1 },
    input: { flex: 1, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, fontSize: 16, fontWeight: '600', marginRight: 8 },
    actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    iconBtn: { padding: 6, borderRadius: 8 },
    saveBtn: { backgroundColor: '#4ECDC4', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
    saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
