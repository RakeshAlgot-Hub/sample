import { useEffect, useMemo, useCallback, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import WizardTopHeader from '@/components/WizardTopHeader';
import { usePropertiesStore } from '@/store/usePropertiesStore';
import { useMembersStore } from '@/store/useMembersStore';
import { Member } from '@/types/member';
import { User } from 'lucide-react-native';

export default function TotalBedsScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { properties, activePropertyId, loadProperties, syncBedOccupancyWithMembers } = usePropertiesStore();
    const { members, loadMembers } = useMembersStore();
    const [filterType, setFilterType] = useState<'total' | 'available'>('total');
    const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);

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

    useEffect(() => {
        if (!activeProperty) {
            setSelectedBuildingId(null);
            return;
        }

        if (!selectedBuildingId || !activeProperty.buildings.some((b) => b.id === selectedBuildingId)) {
            setSelectedBuildingId(activeProperty.buildings[0]?.id ?? null);
        }
    }, [activeProperty, selectedBuildingId]);

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

    const bedStats = useMemo(() => {
        if (!activeProperty) {
            return { total: 0, available: 0 };
        }

        const total = activeProperty.buildings.reduce(
            (acc, building) =>
                acc +
                building.floors.reduce(
                    (fSum, floor) =>
                        fSum +
                        floor.rooms.reduce((rSum, room) => rSum + room.beds.length, 0),
                    0
                ),
            0
        );

        const occupied = activeProperty.buildings.reduce(
            (acc, building) =>
                acc +
                building.floors.reduce(
                    (fSum, floor) =>
                        fSum +
                        floor.rooms.reduce(
                            (rSum, room) => rSum + room.beds.filter((bed) => bed.occupied).length,
                            0
                        ),
                    0
                ),
            0
        );

        return { total, available: total - occupied };
    }, [activeProperty]);

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
            <WizardTopHeader title="Beds" onBack={handleBack} showMenu={false} />
            
            {/* Filter Dropdown */}
            <View style={[styles.filterContainer, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <View style={styles.filterButtons}>
                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            {
                                backgroundColor: filterType === 'total' ? theme.primary + '12' : theme.background,
                                borderColor: filterType === 'total' ? theme.primary : theme.cardBorder,
                            },
                        ]}
                        onPress={() => setFilterType('total')}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.filterButtonText,
                                { color: filterType === 'total' ? theme.primary : theme.textSecondary },
                            ]}
                        >
                            Total
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            {
                                backgroundColor: filterType === 'available' ? theme.primary + '12' : theme.background,
                                borderColor: filterType === 'available' ? theme.primary : theme.cardBorder,
                            },
                        ]}
                        onPress={() => setFilterType('available')}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.filterButtonText,
                                { color: filterType === 'available' ? theme.primary : theme.textSecondary },
                            ]}
                        >
                            Available
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[
                    styles.buildingRow,
                    activeProperty.buildings.length === 1 && styles.buildingRowSingle,
                ]}
            >
                {activeProperty.buildings.map((building) => {
                    const isActive = building.id === selectedBuildingId;
                    return (
                        <TouchableOpacity
                            key={building.id}
                            style={[
                                styles.buildingChip,
                                {
                                    backgroundColor: theme.card,
                                    borderColor: isActive ? theme.primary : theme.cardBorder,
                                },
                            ]}
                            onPress={() => setSelectedBuildingId(building.id)}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.buildingChipText, { color: theme.text }]}>
                                {building.name}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            <ScrollView contentContainerStyle={styles.content}>
                {activeProperty.buildings
                    .filter((building) => !selectedBuildingId || building.id === selectedBuildingId)
                    .map((building) => (
                    <View key={building.id} style={styles.section}>
                        {building.floors.map((floor) => (
                            <View key={floor.id} style={styles.subSection}>
                                <View style={[styles.floorPill, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                                    <Text style={[styles.subTitle, { color: theme.textSecondary }]}>Floor : {floor.label}</Text>
                                </View>
                                {floor.rooms.map((room) => {
                                    // Filter beds based on selected filter type
                                    const filteredBeds = filterType === 'available' 
                                        ? room.beds.filter(bed => !bed.occupied)
                                        : room.beds;

                                    // Skip room if no beds match the filter
                                    if (filteredBeds.length === 0) {
                                        return null;
                                    }

                                    return (
                                        <View key={room.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                                            <Text style={[styles.roomTitle, { color: theme.text }]}>Room {room.roomNumber}</Text>
                                            <View style={styles.bedList}>
                                                {filteredBeds.map((bed) => {
                                                const bedIndex = room.beds.findIndex(b => b.id === bed.id);
                                                const key = `${activeProperty.id}:${building.id}:${floor.id}:${room.id}:${bed.id}`;
                                                const member = memberMap.get(key);
                                                const isAvailable = !bed.occupied;
                                                const bedNumber = `B${bedIndex + 1}`;
                                                const rowStyles = [
                                                    styles.bedRow,
                                                    { borderColor: bed.occupied ? theme.primary : theme.border },
                                                ];
                                                const content = (
                                                    <>
                                                        {bed.occupied && member ? (
                                                            <>
                                                                <View style={styles.memberContainer}>
                                                                    <View style={[styles.profilePic, { backgroundColor: theme.primary + '15' }]}>
                                                                        {member.profilePic ? (
                                                                            <Image source={{ uri: member.profilePic }} style={styles.profileImage} />
                                                                        ) : (
                                                                            <User size={20} color={theme.primary} strokeWidth={2} />
                                                                        )}
                                                                    </View>
                                                                    <Text style={[styles.memberName, { color: theme.text }]}>
                                                                        {member.name} - {bedNumber}
                                                                    </Text>
                                                                </View>
                                                            </>
                                                        ) : (
                                                            <View style={styles.bedInfo}>
                                                                <Text style={[styles.bedLabel, { color: theme.textSecondary }]}>
                                                                    {bedNumber} - Tap to assign
                                                                </Text>
                                                            </View>
                                                        )}
                                                    </>
                                                );

                                                if (!isAvailable) {
                                                    return (
                                                        <View key={bed.id} style={rowStyles}>
                                                            {content}
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
                                                        {content}
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
    filterContainer: {
        marginHorizontal: 16,
        marginTop: 8,
        padding: 6,
        borderRadius: 14,
        borderWidth: 1,
    },
    filterButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    filterButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        alignItems: 'center',
    },
    filterButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    buildingRow: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 4,
        gap: 10,
    },
    buildingRowSingle: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    buildingChip: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        minWidth: 120,
        alignItems: 'center',
    },
    buildingChipText: {
        fontSize: 13,
        fontWeight: '700',
    },
    content: {
        padding: 16,
        paddingTop: 12,
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
        gap: 8,
    },
    floorPill: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        borderWidth: 1,
    },
    subTitle: {
        fontSize: 12,
        fontWeight: '600',
    },
    card: {
        padding: 14,
        borderRadius: 14,
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    bedInfo: {
        flex: 1,
    },
    bedLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    memberContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    profilePic: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    memberName: {
        fontSize: 15,
        fontWeight: '700',
        flex: 1,
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
