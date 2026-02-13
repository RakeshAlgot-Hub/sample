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
import * as buildingService from '@/services/buildingService';
// No floorService or roomService needed for summary-only loading

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

    // Only load building summaries, no nested floors/rooms
    const loadBuildings = async () => {
        setLoading(true);
        const b = await buildingService.getBuildingSummaries(id as string);
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
        await buildingService.updateBuilding(building.propertyId, building.id, { name: draftName.trim() });
        setEditingId(null);
        setDraftName('');
        await loadBuildings();
    };

    const handleDelete = async (building: any) => {
        Alert.alert('Delete Building', `Are you sure you want to delete "${building.name}" and all its floors, rooms, and beds?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    // Backend is responsible for cascading deletes
                    await buildingService.deleteBuilding(building.propertyId, building.id);
                    await loadBuildings();
                }
            }
        ]);
    };

    // No local hierarchy or totals, backend handles all cascade and summary counts.

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
