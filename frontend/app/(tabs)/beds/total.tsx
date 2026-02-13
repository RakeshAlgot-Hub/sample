import { useEffect, useMemo, useCallback, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import WizardTopHeader from '@/components/WizardTopHeader';
import { usePropertiesStore } from '@/store/usePropertiesStore';
import { useMembersStore } from '@/store/useMembersStore';
import { Member } from '@/types/member';
import { Building2, Search, X } from 'lucide-react-native';
import { Bed, Building, Floor, Room } from '@/types/property';
import { getBedsByRoom, getBuildingsByProperty, getFloorsByBuilding, getRoomsByFloor } from '@/utils/propertyRepository';

export default function TotalBedsScreen() {
    const theme = useTheme();
    const router = useRouter();
    const windowWidth = Dimensions.get('window').width;
    const isWideScreen = windowWidth > 768;
    const [searchQuery, setSearchQuery] = useState('');
    const { properties, activePropertyId, loadProperties } = usePropertiesStore();
    const { members, loadMembersByProperty } = useMembersStore();

    // Local hierarchy state (assembled to match property.ts types)
    const [buildings, setBuildings] = useState<Building[]>([]);

    const handleBack = useCallback(() => {
        router.back();
    }, [router]);

    // Progressive loading
    useEffect(() => {
        const loadData = async () => {
            await loadProperties();
            if (activePropertyId) {
                await loadMembersByProperty(activePropertyId);
                // Load buildings
                const flatBuildings = await getBuildingsByProperty(activePropertyId);
                const assembledBuildings: Building[] = [];
                for (const b of flatBuildings) {
                    const flatFloors = await getFloorsByBuilding(b.id);
                    const assembledFloors: Floor[] = [];
                    for (const f of flatFloors) {
                        const flatRooms = await getRoomsByFloor(f.id);
                        const assembledRooms: Room[] = [];
                        for (const r of flatRooms) {
                            const beds = await getBedsByRoom(r.id);
                            // Cast shareType to ShareType
                            assembledRooms.push({
                                ...r,
                                beds,
                                shareType: r.shareType as import("@/types/property").ShareType,
                            });
                        }
                        assembledFloors.push({ ...f, rooms: assembledRooms });
                    }
                    assembledBuildings.push({ ...b, floors: assembledFloors });
                }
                setBuildings(assembledBuildings);
            }
        };
        loadData();
    }, [activePropertyId]);

    // Find active property summary
    const activeProperty = useMemo(() => {
        if (properties.length === 0 || !activePropertyId) {
            return null;
        }
        return properties.find((property) => property.id === activePropertyId) ?? null;
    }, [properties, activePropertyId]);

    // Map for member assignment
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

    // Filtered buildings for search
    const filteredBuildings = useMemo(() => {
        if (!activeProperty || buildings.length === 0) {
            return [];
        }
        if (!searchQuery.trim()) {
            return buildings;
        }
        const query = searchQuery.toLowerCase();
        return buildings
            .map((building) => ({
                ...building,
                floors: building.floors
                    .map((floor) => ({
                        ...floor,
                        rooms: floor.rooms.filter((room) => {
                            return (
                                building.name.toLowerCase().includes(query) ||
                                `floor ${floor.label}`.toLowerCase().includes(query) ||
                                `room ${room.roomNumber}`.toLowerCase().includes(query)
                            );
                        }),
                    }))
                    .filter((floor) => floor.rooms.length > 0),
            }))
            .filter((building) => building.floors.length > 0);
    }, [activeProperty, buildings, searchQuery]);

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
            <View style={[styles.headerContainer, { borderBottomColor: theme.border }]}>
                <WizardTopHeader title="Total Beds" onBack={handleBack} showMenu={false} />
                <View style={[styles.searchBar, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
                    <Search size={18} color={theme.textSecondary} strokeWidth={2} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.text }]}
                        placeholder="Search by building, floor, room..."
                        placeholderTextColor={theme.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
                            <X size={18} color={theme.textSecondary} strokeWidth={2} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView contentContainerStyle={[styles.content, isWideScreen && styles.contentWide]}>
                {filteredBuildings.length === 0 && searchQuery.trim() ? (
                    <View style={styles.emptyState}>
                        <Text style={[styles.emptyTitle, { color: theme.text }]}>No beds found</Text>
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Try adjusting your search</Text>
                    </View>
                ) : (
                    filteredBuildings.map((building) => (
                        <View key={building.id} style={[styles.section, isWideScreen && styles.sectionWide]}>
                            <View style={[styles.sectionHeader, isWideScreen && styles.sectionHeaderWide]}>
                                <View style={[styles.buildingIcon, { backgroundColor: theme.primary + '15' }]}>
                                    <Building2 size={isWideScreen ? 22 : 20} color={theme.primary} strokeWidth={2} />
                                </View>
                                <View style={styles.buildingInfo}>
                                    <Text style={[styles.sectionTitle, { color: theme.text }, isWideScreen && styles.sectionTitleWide]}>
                                        {building.name}
                                    </Text>
                                    <Text style={[styles.buildingStats, { color: theme.textSecondary }, isWideScreen && styles.buildingStatsWide]}>
                                        {building.floors.length} Floor{building.floors.length !== 1 ? 's' : ''}
                                    </Text>
                                </View>
                            </View>

                            {building.floors.map((floor) => (
                                <View key={floor.id} style={[styles.subSection, isWideScreen && styles.subSectionWide]}>
                                    <Text style={[styles.subTitle, { color: theme.textSecondary }, isWideScreen && styles.subTitleWide]}>
                                        Floor {floor.label}
                                    </Text>
                                    <View style={[styles.roomsGrid, isWideScreen && styles.roomsGridWide]}>
                                        {floor.rooms.map((room) => {
                                            if (room.beds.length === 0) {
                                                return null;
                                            }

                                            return (
                                                <View
                                                    key={room.id}
                                                    style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }, isWideScreen && styles.cardWide]}
                                                >
                                                    <Text style={[styles.roomTitle, { color: theme.text }, isWideScreen && styles.roomTitleWide]}>
                                                        Room {room.roomNumber}
                                                    </Text>
                                                    <View style={[styles.bedList, isWideScreen && styles.bedListWide]}>
                                                        {room.beds.map((bed) => {
                                                            const bedIndex = room.beds.findIndex((b) => b.id === bed.id);
                                                            const bedNumber = `Bed ${bedIndex + 1}`;
                                                            const key = `${activeProperty.id}:${building.id}:${floor.id}:${room.id}:${bed.id}`;
                                                            const member = memberMap.get(key);
                                                            const isAvailable = !bed.occupied;

                                                            const rowStyles = [
                                                                styles.bedRow,
                                                                {
                                                                    borderColor: isAvailable ? theme.cardBorder : theme.primary + '33',
                                                                    backgroundColor: isAvailable ? 'transparent' : theme.primary + '08',
                                                                },
                                                                isWideScreen && styles.bedRowWide,
                                                            ];

                                                            const statusText = isAvailable
                                                                ? 'Not assigned'
                                                                : member?.name || 'Occupied';

                                                            const rowContent = (
                                                                <>
                                                                    <View style={styles.bedInfo}>
                                                                        <Text style={[styles.bedLabel, { color: theme.text }, isWideScreen && styles.bedLabelWide]}>
                                                                            {bedNumber}
                                                                        </Text>
                                                                        <Text style={[styles.bedSubLabel, { color: theme.textSecondary }, isWideScreen && styles.bedSubLabelWide]}>
                                                                            {statusText}
                                                                        </Text>
                                                                    </View>
                                                                    <View
                                                                        style={[
                                                                            styles.statusPill,
                                                                            {
                                                                                backgroundColor: isAvailable
                                                                                    ? theme.success + '20'
                                                                                    : theme.primary + '20',
                                                                            },
                                                                            isWideScreen && styles.statusPillWide,
                                                                        ]}
                                                                    >
                                                                        <Text
                                                                            style={[
                                                                                styles.statusText,
                                                                                { color: isAvailable ? theme.success : theme.primary },
                                                                                isWideScreen && styles.statusTextWide,
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
                                                                    activeOpacity={0.6}
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
                                </View>
                            ))}
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        borderBottomWidth: 1,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        outlineWidth: 0,
    },
    content: {
        padding: 16,
        paddingTop: 12,
        paddingBottom: 100,
        gap: 20,
    },
    contentWide: {
        paddingHorizontal: 32,
        paddingVertical: 24,
        gap: 32,
        maxWidth: 1200,
        alignSelf: 'center',
        width: '100%',
    },
    section: {
        gap: 14,
    },
    sectionWide: {
        gap: 18,
        marginBottom: 12,
    },
    sectionHeader: {
        paddingVertical: 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    sectionHeaderWide: {
        paddingVertical: 8,
        gap: 14,
    },
    buildingIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buildingInfo: {
        flex: 1,
        gap: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    sectionTitleWide: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: 0.4,
    },
    buildingStats: {
        fontSize: 13,
        fontWeight: '500',
    },
    buildingStatsWide: {
        fontSize: 14,
        fontWeight: '600',
    },
    subSection: {
        gap: 10,
        marginLeft: 0,
    },
    subSectionWide: {
        gap: 14,
        marginLeft: 0,
    },
    subTitle: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    subTitleWide: {
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 0.7,
        marginBottom: 4,
    },
    roomsGrid: {
        gap: 12,
    },
    roomsGridWide: {
        gap: 16,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        gap: 12,
    },
    cardWide: {
        padding: 20,
        borderRadius: 16,
        width: '48%',
        marginBottom: 4,
    },
    roomTitle: {
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    roomTitleWide: {
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.3,
    },
    bedList: {
        gap: 10,
    },
    bedListWide: {
        gap: 12,
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
    bedRowWide: {
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderRadius: 14,
    },
    bedInfo: {
        gap: 4,
        flex: 1,
    },
    bedLabel: {
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    bedLabelWide: {
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: 0.3,
    },
    bedSubLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    bedSubLabelWide: {
        fontSize: 13,
        fontWeight: '700',
    },
    statusPill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    statusPillWide: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statusTextWide: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 0.6,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    emptyText: {
        fontSize: 15,
        fontWeight: '500',
    },
});
