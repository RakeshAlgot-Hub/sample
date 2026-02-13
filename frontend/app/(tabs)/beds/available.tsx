import { useEffect, useMemo, useState, useCallback } from 'react';
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
import { Building, Floor, Room, ShareType, Bed } from '@/types/property';
import { getBedsByRoom, getBuildingsByProperty, getFloorsByBuilding, getRoomsByFloor } from '@/utils/propertyRepository';
import { Search, X } from 'lucide-react-native';
import { Bed as BedIcon } from 'lucide-react-native';

export default function AvailableBedsScreen() {
    const theme = useTheme();
    const router = useRouter();
    const windowWidth = Dimensions.get('window').width;
    const isWideScreen = windowWidth > 768;
    const [searchQuery, setSearchQuery] = useState('');
    const { properties, activePropertyId, loadProperties } = usePropertiesStore();
    const { loadMembersByProperty } = useMembersStore();

    // Local hierarchy state
    const [buildings, setBuildings] = useState<Building[]>([]);

    const handleBack = useCallback(() => {
        router.back();
    }, [router]);

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
                            assembledRooms.push({
                                ...r,
                                beds,
                                shareType: r.shareType as ShareType,
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

    const activeProperty = useMemo(() => {
        if (properties.length === 0 || !activePropertyId) {
            return null;
        }
        return properties.find((property) => property.id === activePropertyId) ?? null;
    }, [properties, activePropertyId]);

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
                            const availableBeds = room.beds.filter((bed) => !bed.occupied);
                            if (availableBeds.length === 0) return false;
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
                <WizardTopHeader title="Available Beds" onBack={handleBack} showMenu={false} />
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
                <WizardTopHeader title="Available Beds" onBack={handleBack} showMenu={false} />
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
                            <Text style={[styles.sectionTitle, { color: theme.text }, isWideScreen && styles.sectionTitleWide]}>
                                {building.name}
                            </Text>
                            {building.floors.map((floor) => (
                                <View key={floor.id} style={[styles.subSection, isWideScreen && styles.subSectionWide]}>
                                    <Text style={[styles.subTitle, { color: theme.textSecondary }, isWideScreen && styles.subTitleWide]}>
                                        Floor {floor.label}
                                    </Text>
                                    <View style={[styles.roomsGrid, isWideScreen && styles.roomsGridWide]}>
                                        {floor.rooms.map((room) => {
                                            const availableBeds = room.beds.filter((bed) => !bed.occupied);
                                            if (availableBeds.length === 0) {
                                                return null;
                                            }
                                            return (
                                                <View key={room.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }, isWideScreen && styles.cardWide]}>
                                                    <View style={[styles.roomHeader, isWideScreen && styles.roomHeaderWide]}>
                                                        <BedIcon size={isWideScreen ? 20 : 18} color={theme.primary} strokeWidth={2} />
                                                        <Text style={[styles.roomTitle, { color: theme.text }, isWideScreen && styles.roomTitleWide]}>
                                                            Room {room.roomNumber}
                                                        </Text>
                                                        <View style={[styles.bedCount, { backgroundColor: theme.primary + '15' }]}>
                                                            <Text style={[styles.bedCountText, { color: theme.primary }]}>
                                                                {availableBeds.length}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    <View style={[styles.bedList, isWideScreen && styles.bedListWide]}>
                                                        {availableBeds.map((bed, index) => (
                                                            <TouchableOpacity
                                                                key={bed.id}
                                                                style={[styles.bedRow, { borderColor: theme.border }, isWideScreen && styles.bedRowWide]}
                                                                onPress={() =>
                                                                    router.push({
                                                                        pathname: '/member/add',
                                                                        params: {
                                                                            propertyId: activeProperty.id,
                                                                            buildingId: building.id,
                                                                            floorId: floor.id,
                                                                            roomId: room.id,
                                                                            bedId: bed.id,
                                                                            from: 'available',
                                                                        },
                                                                    })
                                                                }
                                                                activeOpacity={0.6}
                                                            >
                                                                <View style={styles.bedInfo}>
                                                                    <Text style={[styles.bedLabel, { color: theme.text }, isWideScreen && styles.bedLabelWide]}>
                                                                        Bed {index + 1}
                                                                    </Text>
                                                                    <View style={[styles.availableBadge, { backgroundColor: theme.success + '20' }]}>
                                                                        <Text style={[styles.availableText, { color: theme.success }]}>
                                                                            Available
                                                                        </Text>
                                                                    </View>
                                                                </View>
                                                                <Text style={[styles.bedValue, { color: theme.textSecondary }]}>
                                                                    →
                                                                </Text>
                                                            </TouchableOpacity>
                                                        ))}
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
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    sectionTitleWide: {
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: 0.4,
        marginBottom: 8,
    },
    subSection: {
        gap: 10,
    },
    subSectionWide: {
        gap: 14,
    },
    subTitle: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    subTitleWide: {
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.6,
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
    roomHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    roomHeaderWide: {
        gap: 12,
        marginBottom: 4,
    },
    roomTitle: {
        fontSize: 15,
        fontWeight: '700',
        flex: 1,
    },
    roomTitleWide: {
        fontSize: 16,
        fontWeight: '800',
    },
    bedCount: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        minWidth: 32,
        alignItems: 'center',
    },
    bedCountText: {
        fontSize: 13,
        fontWeight: '700',
    },
    bedList: {
        gap: 10,
    },
    bedListWide: {
        gap: 12,
    },
    bedRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    },
    bedLabelWide: {
        fontSize: 15,
        fontWeight: '800',
    },
    availableBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    availableText: {
        fontSize: 11,
        fontWeight: '700',
    },
    bedValue: {
        fontSize: 16,
        fontWeight: '600',
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
