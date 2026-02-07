import { useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import WizardTopHeader from '@/components/WizardTopHeader';
import { usePropertiesStore } from '@/store/usePropertiesStore';
import { useMembersStore } from '@/store/useMembersStore';

export default function TotalBedsScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { properties, activePropertyId, loadProperties, syncBedOccupancyWithMembers } = usePropertiesStore();
    const { members, loadMembers } = useMembersStore();

    useEffect(() => {
        const loadData = async () => {
            await loadProperties();
            await loadMembers();
            await syncBedOccupancyWithMembers(members);
        };
        loadData();
    }, []);

    const activeProperty = useMemo(() => {
        if (properties.length === 0) {
            return null;
        }
        return properties.find((property) => property.id === activePropertyId) ?? properties[0];
    }, [properties, activePropertyId]);

    const memberMap = useMemo(() => {
        const map = new Map<string, string>();
        members.forEach((member) => {
            if (member.propertyId && member.buildingId && member.floorId && member.roomId && member.bedId) {
                const key = `${member.propertyId}:${member.buildingId}:${member.floorId}:${member.roomId}:${member.bedId}`;
                map.set(key, member.name);
            }
        });
        return map;
    }, [members]);

    if (!activeProperty) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <WizardTopHeader title="Total Beds" onBack={() => router.back()} showMenu={false} />
                <View style={styles.emptyState}>
                    <Text style={[styles.emptyTitle, { color: theme.text }]}>No properties</Text>
                    <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Create a property first.</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <WizardTopHeader title="Total Beds" onBack={() => router.back()} showMenu={false} />
            <ScrollView contentContainerStyle={styles.content}>
                {activeProperty.buildings.map((building) => (
                    <View key={building.id} style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>{building.name}</Text>
                        {building.floors.map((floor) => (
                            <View key={floor.id} style={styles.subSection}>
                                <Text style={[styles.subTitle, { color: theme.textSecondary }]}>{floor.label}</Text>
                                {floor.rooms.map((room) => (
                                    <View key={room.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                                        <Text style={[styles.roomTitle, { color: theme.text }]}>Room {room.roomNumber}</Text>
                                        <View style={styles.bedList}>
                                            {room.beds.map((bed, index) => {
                                                const key = `${activeProperty.id}:${building.id}:${floor.id}:${room.id}:${bed.id}`;
                                                const occupant = memberMap.get(key);
                                                return (
                                                    <View
                                                        key={bed.id}
                                                        style={[
                                                            styles.bedRow,
                                                            { borderColor: bed.occupied ? theme.primary : theme.border },
                                                        ]}
                                                    >
                                                        <Text style={[styles.bedLabel, { color: theme.text }]}>Bed {index + 1}</Text>
                                                        <Text style={[styles.bedValue, { color: bed.occupied ? theme.text : theme.textSecondary }]}>
                                                            {bed.occupied ? occupant ?? 'Occupied' : 'Available'}
                                                        </Text>
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ))}
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
        paddingBottom: 100,
        gap: 16,
    },
    section: {
        gap: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    subSection: {
        gap: 10,
    },
    subTitle: {
        fontSize: 14,
        fontWeight: '600',
    },
    card: {
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        gap: 10,
    },
    roomTitle: {
        fontSize: 14,
        fontWeight: '700',
    },
    bedList: {
        gap: 8,
    },
    bedRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 10,
        borderWidth: 1,
    },
    bedLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
    bedValue: {
        fontSize: 13,
        fontWeight: '600',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    emptyText: {
        fontSize: 13,
    },
});
