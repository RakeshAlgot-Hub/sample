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

import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { Building2, Edit2, Trash2 } from 'lucide-react-native';
import * as buildingService from '@/services/buildingService';
import ManageHeader from '@/components/ManageHeader';
import { useRouter } from 'expo-router';

export default function PropertyBuildingsScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id?: string }>();
    const [buildings, setBuildings] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        if (!id) return;
        loadBuildings();
    }, [id]);

    const loadBuildings = async () => {
        setLoading(true);
        const b = await buildingService.getBuildingSummaries(id as string);
        setBuildings(Array.isArray(b) ? b : []);
        setLoading(false);
    };

    const handleBack = () => {
        router.replace('/properties');
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}> 
            <ManageHeader title="Buildings" onBack={handleBack} />
            <ScrollView contentContainerStyle={styles.content}>
                {loading ? (
                    <Text style={{ color: theme.textSecondary }}>Loading...</Text>
                ) : buildings.length === 0 ? (
                    <Text style={{ color: theme.textSecondary }}>No buildings found.</Text>
                ) : (
                    buildings.map((building) => (
                        <View key={building} style={[styles.buildingCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}> 
                            <View style={styles.buildingRow}>
                                <Building2 size={22} color={theme.primary} style={{ marginRight: 8 }} />
                                <Text style={[styles.buildingName, { color: theme.text }]}>{building}</Text>
                                <View style={styles.actions}>
                                    <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
                                        <Edit2 size={18} color={theme.primary} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
                                        <Trash2 size={18} color={theme.error || '#E74C3C'} />
                                    </TouchableOpacity>
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
    // ...existing code...
    buildingCard: { borderWidth: 1, borderRadius: 14, marginBottom: 14, padding: 14 },
    buildingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    buildingName: { fontSize: 16, fontWeight: '600', flex: 1 },
    input: { flex: 1, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, fontSize: 16, fontWeight: '600', marginRight: 8 },
    actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    iconBtn: { padding: 6, borderRadius: 8 },
    saveBtn: { backgroundColor: '#4ECDC4', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
    saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
