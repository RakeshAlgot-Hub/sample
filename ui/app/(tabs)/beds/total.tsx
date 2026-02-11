import { useEffect, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import WizardTopHeader from '@/components/WizardTopHeader';
import { usePropertiesStore } from '@/store/usePropertiesStore';
import { useMembersStore } from '@/store/useMembersStore';
import { Member } from '@/types/member';

export default function TotalBedsScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { properties, activePropertyId, loadProperties, syncBedOccupancyWithMembers } = usePropertiesStore();
    const { members, loadMembers } = useMembersStore();

    const handleBack = useCallback(() => {
        router.back();
    }, [router]);

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
        const map = new Map<string, Member>();
        members.forEach((member) => {
            if (member.propertyId && member.buildingId && member.floorId && member.roomId && member.bedId) {
                const key = `${member.propertyId}:${member.buildingId}:${member.floorId}:${member.roomId}:${member.bedId}`;
                map.set(key, member);
            }
        });
        return map;
    }, [members]);

    if (!activeProperty) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <WizardTopHeader title="Beds" onBack={handleBack} showMenu={false} />
                <View style={styles.emptyState}>
                    <Text style={[styles.emptyTitle, { color: theme.text }]}>No properties</Text>
                    <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Create a property first.</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <WizardTopHeader title="Total Beds" onBack={handleBack} showMenu={false} />

            <ScrollView contentContainerStyle={styles.content}>
                {activeProperty.buildings.map((building) => (
                    <View key={building.id} style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}> {building.name} </Text>
                        </View>
                        {building.floors.map((floor) => (
                            <View key={floor.id} style={styles.subSection}>
                                <Text style={[styles.subTitle, { color: theme.textSecondary }]}>Floor {floor.label}</Text>
                                {floor.rooms.map((room) => {
                                    if (room.beds.length === 0) {
                                        return null;
                                    }

                                    return (
                                        <View
                                            key={room.id}
                                            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                                        >
                                            <Text style={[styles.roomTitle, { color: theme.text }]}>Room {room.roomNumber}</Text>
                                            <View style={styles.bedList}>
                                                {room.beds.map((bed) => {
                                                    const bedIndex = room.beds.findIndex((b) => b.id === bed.id);
                                                    const bedNumber = `Bed ${bedIndex + 1}`;
                                                    const key = `${activeProperty.id}:${building.id}:${floor.id}:${room.id}:${bed.id}`;
                                                    const member = memberMap.get(key);
                                                    const isAvailable = !bed.occupied;

                                                    const rowStyles = [
                                                        styles.bedRow,
                                                        { borderColor: isAvailable ? theme.cardBorder : theme.primary + '55' },
                                                    ];

                                                    const statusText = isAvailable
                                                        ? 'Available'
                                                        : member?.name || 'Occupied';

                                                    const rowContent = (
                                                        <>
                                                            <View style={styles.bedInfo}>
                                                                <Text style={[styles.bedLabel, { color: theme.text }]}>
                                                                    {bedNumber}
                                                                </Text>
                                                                <Text style={[styles.bedSubLabel, { color: theme.textSecondary }]}>
                                                                    {statusText}
                                                                </Text>
                                                            </View>
                                                            <View
                                                                style={[
                                                                    styles.statusPill,
                                                                    {
                                                                        backgroundColor: isAvailable
                                                                            ? theme.accent + '20'
                                                                            : theme.primary + '15',
                                                                    },
                                                                ]}
                                                            >
                                                                <Text
                                                                    style={[
                                                                        styles.statusText,
                                                                        { color: isAvailable ? theme.accent : theme.primary },
                                                                    ]}
                                                                >
                                                                    {isAvailable ? 'Open' : 'Assigned'}
                                                                </Text>
                                                            </View>
                                                        </>
                                                    );

                                                    if (!isAvailable) {
                                                        return (
                                                            <View key={bed.id} style={rowStyles}>
                                                                {rowContent}
                                                            </View>
                                                        );
                                                    }

                                                    return (
                                                        <TouchableOpacity
                                                            key={bed.id}
                                                            style={rowStyles}
                                                            onPress={() =>
                                                                router.push({
                                                                    pathname: '/member/add',
                                                                    params: {
                                                                        propertyId: activeProperty.id,
                                                                        buildingId: building.id,
                                                                        floorId: floor.id,
                                                                        roomId: room.id,
                                                                        bedId: bed.id,
                                                                        from: 'total',
                                                                    },
                                                                })
                                                            }
                                                            activeOpacity={0.7}
                                                        >
                                                            {rowContent}
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </View>
                                        </View>
                                    );
                                })}
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
        paddingTop: 12,
        paddingBottom: 100,
        gap: 20,
    },
    section: {
        gap: 14,
    },
    sectionHeader: {
        paddingVertical: 4,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
    },
    subSection: {
        gap: 8,
    },
    subTitle: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    card: {
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        gap: 12,
    },
    roomTitle: {
        fontSize: 14,
        fontWeight: '700',
    },
    bedList: {
        gap: 10,
    },
    bedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    bedInfo: {
        gap: 4,
    },
    bedLabel: {
        fontSize: 13,
        fontWeight: '700',
    },
    bedSubLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    statusPill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
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
