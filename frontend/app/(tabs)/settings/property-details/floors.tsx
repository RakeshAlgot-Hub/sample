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
import * as buildingService from '@/services/buildingService';
import * as floorService from '@/services/floorService';

export default function PropertyFloorsScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id?: string }>();
    const [buildings, setBuildings] = useState<any[]>([]);
    const [expandedBuildingId, setExpandedBuildingId] = useState<string | null>(null);
    const [floorsByBuilding, setFloorsByBuilding] = useState<Record<string, any[]>>({});
    const [editingId, setEditingId] = useState<string | null>(null);
    const [draftLabel, setDraftLabel] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingFloors, setLoadingFloors] = useState<string | null>(null);

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
            return;
        }
        setExpandedBuildingId(buildingId);
        if (!floorsByBuilding[buildingId]) {
            setLoadingFloors(buildingId);
            const floors = await floorService.getFloorSummaries(id as string, buildingId);
            setFloorsByBuilding((prev) => ({ ...prev, [buildingId]: floors }));
            setLoadingFloors(null);
        }
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
        await floorService.updateFloor(floor.propertyId, floor.buildingId, floor.id, { name: draftLabel.trim() });
        setEditingId(null);
        setDraftLabel('');
        // Reload floors for this building only
        if (expandedBuildingId) {
            setLoadingFloors(expandedBuildingId);
            const floors = await floorService.getFloorSummaries(id as string, expandedBuildingId);
            setFloorsByBuilding((prev) => ({ ...prev, [expandedBuildingId]: floors }));
            setLoadingFloors(null);
        }
    };

    const handleDelete = async (floor: any) => {
        Alert.alert('Delete Floor', `Are you sure you want to delete "${floor.label}" and all its rooms and beds?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    // Backend is responsible for cascading deletes
                    await floorService.deleteFloor(floor.propertyId, floor.buildingId, floor.id);
                    // Reload floors for this building only
                    if (expandedBuildingId) {
                        setLoadingFloors(expandedBuildingId);
                        const floors = await floorService.getFloorSummaries(id as string, expandedBuildingId);
                        setFloorsByBuilding((prev) => ({ ...prev, [expandedBuildingId]: floors }));
                        setLoadingFloors(null);
                    }
                }
            }
        ]);
    };

    // No local hierarchy or totals, backend handles all cascade and summary counts.

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
