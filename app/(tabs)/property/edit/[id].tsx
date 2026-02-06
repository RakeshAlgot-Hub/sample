import { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { usePropertiesStore } from '@/store/usePropertiesStore';
import { generateBedsByCount } from '@/utils/bedHelpers';
import { BillingPeriod, Building, Floor, Property, ShareType } from '@/types/property';
import FloorCard from '@/components/FloorCard';
import EditableRoomCard from '@/components/EditableRoomCard';
import ConfirmModal from '@/components/ConfirmModal';
import { Building2, DoorOpen, Save, Trash2 } from 'lucide-react-native';

const BED_COUNTS = [1, 2, 3];
const PERIODS: BillingPeriod[] = ['monthly', 'weekly', 'hourly', 'yearly'];

const getShareTypeFromBedCount = (bedCount: number): ShareType => {
    if (bedCount === 1) return 'single';
    if (bedCount === 2) return 'double';
    return 'triple';
};

export default function EditPropertyScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { properties, loadProperties, updateProperty } = usePropertiesStore();

    const [draft, setDraft] = useState<Property | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [newBuildingName, setNewBuildingName] = useState('');
    const [editingBuildingId, setEditingBuildingId] = useState<string | null>(null);
    const [editingBuildingName, setEditingBuildingName] = useState('');

    const [selectedFloorBuildingId, setSelectedFloorBuildingId] = useState('');
    const [newFloorLabel, setNewFloorLabel] = useState('');

    const [selectedRoomBuildingId, setSelectedRoomBuildingId] = useState('');
    const [selectedRoomFloorId, setSelectedRoomFloorId] = useState('');
    const [roomNumber, setRoomNumber] = useState('');
    const [selectedBedCount, setSelectedBedCount] = useState<number>(BED_COUNTS[0]);
    const [pricingByCount, setPricingByCount] = useState<Record<number, { price: string; period: BillingPeriod }>>({});
    const [confirmConfig, setConfirmConfig] = useState<{
        title: string;
        message: string;
        onConfirm: () => void;
    } | null>(null);

    useEffect(() => {
        loadProperties();
    }, [loadProperties]);

    const property = useMemo(
        () => properties.find((p) => p.id === id),
        [properties, id]
    );

    useEffect(() => {
        if (!property) return;
        setDraft(JSON.parse(JSON.stringify(property)) as Property);
    }, [property]);

    useEffect(() => {
        if (!draft) return;

        const bedCounts = new Set<number>();
        (draft.bedPricing || []).forEach((pricing) => bedCounts.add(pricing.bedCount));

        draft.buildings.forEach((building) => {
            building.floors.forEach((floor) => {
                floor.rooms.forEach((room) => {
                    const count = room.bedCount ?? room.beds.length;
                    if (count > 0) {
                        bedCounts.add(count);
                    }
                });
            });
        });

        const mapped: Record<number, { price: string; period: BillingPeriod }> = {};
        (draft.bedPricing || []).forEach((pricing) => {
            mapped[pricing.bedCount] = {
                price: pricing.price.toString(),
                period: pricing.period,
            };
        });

        bedCounts.forEach((count) => {
            if (!mapped[count]) {
                mapped[count] = { price: '0', period: 'monthly' };
            }
        });

        setPricingByCount(mapped);
        const sortedCounts = Array.from(bedCounts).sort((a, b) => a - b);
        if (sortedCounts.length > 0 && !sortedCounts.includes(selectedBedCount)) {
            setSelectedBedCount(sortedCounts[0]);
        }
    }, [draft]);

    useEffect(() => {
        if (!draft) return;
        const firstBuilding = draft.buildings[0];

        if (firstBuilding) {
            if (!selectedFloorBuildingId || !draft.buildings.some((b) => b.id === selectedFloorBuildingId)) {
                setSelectedFloorBuildingId(firstBuilding.id);
            }
            if (!selectedRoomBuildingId || !draft.buildings.some((b) => b.id === selectedRoomBuildingId)) {
                setSelectedRoomBuildingId(firstBuilding.id);
            }
        }
    }, [draft, selectedFloorBuildingId, selectedRoomBuildingId]);

    useEffect(() => {
        if (!draft) return;
        const building = draft.buildings.find((b) => b.id === selectedRoomBuildingId);
        const firstFloor = building?.floors[0];

        if (firstFloor) {
            if (!selectedRoomFloorId || !building?.floors.some((f) => f.id === selectedRoomFloorId)) {
                setSelectedRoomFloorId(firstFloor.id);
            }
        }
    }, [draft, selectedRoomBuildingId, selectedRoomFloorId]);

    const selectedFloorBuilding = draft?.buildings.find((b) => b.id === selectedFloorBuildingId);
    const selectedRoomBuilding = draft?.buildings.find((b) => b.id === selectedRoomBuildingId);
    const selectedRoomFloor = selectedRoomBuilding?.floors.find((f) => f.id === selectedRoomFloorId);
    const availableBedCounts = Object.keys(pricingByCount).length > 0
        ? Object.keys(pricingByCount).map((count) => Number(count)).sort((a, b) => a - b)
        : BED_COUNTS;

    const updateDraft = (updater: (current: Property) => Property) => {
        setDraft((current) => (current ? updater(current) : current));
    };

    const getTotals = (buildings: Building[]) => {
        const totalRooms = buildings.reduce(
            (acc, building) =>
                acc + building.floors.reduce((sum, floor) => sum + floor.rooms.length, 0),
            0
        );
        const totalBeds = buildings.reduce(
            (acc, building) =>
                acc +
                building.floors.reduce(
                    (sum, floor) =>
                        sum + floor.rooms.reduce((bedSum, room) => bedSum + room.beds.length, 0),
                    0
                ),
            0
        );

        return { totalRooms, totalBeds };
    };

    const commitDraft = async (nextDraft: Property) => {
        setDraft(nextDraft);
        const totals = getTotals(nextDraft.buildings);
        const bedPricing = Object.entries(pricingByCount)
            .map(([count, entry]) => ({
                bedCount: Number(count),
                price: Number(entry.price) || 0,
                period: entry.period,
            }))
            .sort((a, b) => a.bedCount - b.bedCount);

        await updateProperty(nextDraft.id, {
            name: nextDraft.name,
            city: nextDraft.city,
            buildings: nextDraft.buildings,
            bedPricing,
            totalRooms: totals.totalRooms,
            totalBeds: totals.totalBeds,
        });
    };

    const confirmDelete = (title: string, message: string, onConfirm: () => void) => {
        setConfirmConfig({ title, message, onConfirm });
    };

    const handleSave = async () => {
        if (!draft || !draft.name.trim()) return;

        setIsSaving(true);
        await commitDraft(draft);
        setIsSaving(false);
        router.back();
    };

    const handleAddBuilding = () => {
        if (!newBuildingName.trim()) return;

        const building: Building = {
            id: Date.now().toString(),
            name: newBuildingName.trim(),
            floors: [],
        };

        updateDraft((current) => ({
            ...current,
            buildings: [...current.buildings, building],
        }));

        setNewBuildingName('');
    };

    const handleStartEditBuilding = (building: Building) => {
        setEditingBuildingId(building.id);
        setEditingBuildingName(building.name);
    };

    const handleSaveEditBuilding = () => {
        if (!editingBuildingId || !editingBuildingName.trim()) return;

        updateDraft((current) => ({
            ...current,
            buildings: current.buildings.map((b) =>
                b.id === editingBuildingId ? { ...b, name: editingBuildingName.trim() } : b
            ),
        }));

        setEditingBuildingId(null);
        setEditingBuildingName('');
    };

    const handleRemoveBuilding = (buildingId: string) => {
        if (!draft) return;
        const currentDraft = draft;

        confirmDelete(
            'Delete Building',
            'Delete this building and all its floors, rooms, and beds?',
            () => {
                const nextDraft: Property = {
                    ...currentDraft,
                    buildings: currentDraft.buildings.filter((b) => b.id !== buildingId),
                };

                void commitDraft(nextDraft);
            }
        );
    };

    const handleAddFloor = () => {
        if (!selectedFloorBuildingId || !newFloorLabel.trim()) return;

        const floor: Floor = {
            id: Date.now().toString() + Math.random(),
            label: newFloorLabel.trim(),
            rooms: [],
        };

        updateDraft((current) => ({
            ...current,
            buildings: current.buildings.map((b) =>
                b.id === selectedFloorBuildingId
                    ? { ...b, floors: [...b.floors, floor] }
                    : b
            ),
        }));

        setNewFloorLabel('');
    };

    const handleUpdateFloor = (floorId: string, label: string) => {
        if (!selectedFloorBuildingId) return;

        updateDraft((current) => ({
            ...current,
            buildings: current.buildings.map((b) =>
                b.id === selectedFloorBuildingId
                    ? {
                        ...b,
                        floors: b.floors.map((f) => (f.id === floorId ? { ...f, label } : f)),
                    }
                    : b
            ),
        }));
    };

    const handleRemoveFloor = (floorId: string) => {
        if (!selectedFloorBuildingId || !draft) return;
        const currentDraft = draft;

        confirmDelete(
            'Delete Floor',
            'Delete this floor and all its rooms and beds?',
            () => {
                const nextDraft: Property = {
                    ...currentDraft,
                    buildings: currentDraft.buildings.map((b) =>
                        b.id === selectedFloorBuildingId
                            ? { ...b, floors: b.floors.filter((f) => f.id !== floorId) }
                            : b
                    ),
                };

                void commitDraft(nextDraft);
            }
        );
    };

    const handleAddRoom = () => {
        if (!selectedRoomBuildingId || !selectedRoomFloorId || !roomNumber.trim()) return;

        const shareType = getShareTypeFromBedCount(selectedBedCount);

        updateDraft((current) => ({
            ...current,
            buildings: current.buildings.map((b) =>
                b.id === selectedRoomBuildingId
                    ? {
                        ...b,
                        floors: b.floors.map((f) =>
                            f.id === selectedRoomFloorId
                                ? {
                                    ...f,
                                    rooms: [
                                        ...f.rooms,
                                        {
                                            id: Date.now().toString() + Math.random(),
                                            roomNumber: roomNumber.trim(),
                                            shareType,
                                            bedCount: selectedBedCount,
                                            beds: generateBedsByCount(selectedBedCount),
                                        },
                                    ],
                                }
                                : f
                        ),
                    }
                    : b
            ),
        }));

        setRoomNumber('');
    };

    const handleUpdateRoom = (roomId: string, newRoomNumber: string) => {
        if (!selectedRoomBuildingId || !selectedRoomFloorId) return;

        updateDraft((current) => ({
            ...current,
            buildings: current.buildings.map((b) =>
                b.id === selectedRoomBuildingId
                    ? {
                        ...b,
                        floors: b.floors.map((f) =>
                            f.id === selectedRoomFloorId
                                ? {
                                    ...f,
                                    rooms: f.rooms.map((room) =>
                                        room.id === roomId
                                            ? { ...room, roomNumber: newRoomNumber }
                                            : room
                                    ),
                                }
                                : f
                        ),
                    }
                    : b
            ),
        }));
    };

    const handleRemoveRoom = (roomId: string) => {
        if (!selectedRoomBuildingId || !selectedRoomFloorId || !draft) return;
        const currentDraft = draft;

        confirmDelete(
            'Delete Room',
            'Delete this room and its beds?',
            () => {
                const nextDraft: Property = {
                    ...currentDraft,
                    buildings: currentDraft.buildings.map((b) =>
                        b.id === selectedRoomBuildingId
                            ? {
                                ...b,
                                floors: b.floors.map((f) =>
                                    f.id === selectedRoomFloorId
                                        ? {
                                            ...f,
                                            rooms: f.rooms.filter((room) => room.id !== roomId),
                                        }
                                        : f
                                ),
                            }
                            : b
                    ),
                };

                void commitDraft(nextDraft);
            }
        );
    };

    if (!draft) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.emptyContent}>
                    <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                        Loading property...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}
        >
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={[styles.backButton, { backgroundColor: theme.inputBackground }]}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.backText, { color: theme.text }]}>Back</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Edit Property</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
            >
                <View style={styles.section}
                >
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                        Property Info
                    </Text>
                    <View style={styles.field}
                    >
                        <Text style={[styles.label, { color: theme.text }]}>Property Name</Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: theme.inputBackground,
                                    borderColor: theme.inputBorder,
                                    color: theme.text,
                                },
                            ]}
                            value={draft.name}
                            onChangeText={(value) =>
                                updateDraft((current) => ({ ...current, name: value }))
                            }
                            placeholder="Property name"
                            placeholderTextColor={theme.textSecondary}
                        />
                    </View>
                    <View style={styles.field}
                    >
                        <Text style={[styles.label, { color: theme.text }]}>Property Type</Text>
                        <View
                            style={[
                                styles.readonlyBox,
                                { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder },
                            ]}
                        >
                            <Text style={[styles.readonlyText, { color: theme.textSecondary }]}>
                                {draft.type}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.field}
                    >
                        <Text style={[styles.label, { color: theme.text }]}>City</Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: theme.inputBackground,
                                    borderColor: theme.inputBorder,
                                    color: theme.text,
                                },
                            ]}
                            value={draft.city}
                            onChangeText={(value) =>
                                updateDraft((current) => ({ ...current, city: value }))
                            }
                            placeholder="City"
                            placeholderTextColor={theme.textSecondary}
                        />
                    </View>
                </View>

                <View style={styles.section}
                >
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Edit Buildings</Text>
                    <View style={styles.inputRow}
                    >
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    flex: 1,
                                    backgroundColor: theme.inputBackground,
                                    borderColor: theme.inputBorder,
                                    color: theme.text,
                                },
                            ]}
                            placeholder="Building name"
                            placeholderTextColor={theme.textSecondary}
                            value={newBuildingName}
                            onChangeText={setNewBuildingName}
                        />
                        <TouchableOpacity
                            style={[styles.addButton, { backgroundColor: theme.primary }]}
                            onPress={handleAddBuilding}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.addButtonText}>Add</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.section}
                    >
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Bed Pricing</Text>
                        {Object.keys(pricingByCount).length === 0 ? (
                            <Text style={[styles.emptyPricingText, { color: theme.textSecondary }]}>
                                Add rooms to set pricing.
                            </Text>
                        ) : (
                            <View style={styles.pricingList}>
                                {Object.entries(pricingByCount)
                                    .sort(([a], [b]) => Number(a) - Number(b))
                                    .map(([count, entry]) => (
                                        <View key={count} style={styles.pricingCard}>
                                            <Text style={[styles.pricingLabel, { color: theme.text }]}
                                            >
                                                {count} Beds
                                            </Text>
                                            <TextInput
                                                style={[
                                                    styles.pricingInput,
                                                    {
                                                        backgroundColor: theme.inputBackground,
                                                        borderColor: theme.inputBorder,
                                                        color: theme.text,
                                                    },
                                                ]}
                                                placeholder="Price"
                                                placeholderTextColor={theme.textSecondary}
                                                keyboardType="decimal-pad"
                                                value={entry.price}
                                                onChangeText={(value) =>
                                                    setPricingByCount((current) => ({
                                                        ...current,
                                                        [count]: { price: value, period: entry.period },
                                                    }))
                                                }
                                            />
                                            <View style={styles.periodRow}
                                            >
                                                {PERIODS.map((period) => {
                                                    const isActive = entry.period === period;
                                                    return (
                                                        <TouchableOpacity
                                                            key={period}
                                                            style={[
                                                                styles.periodButton,
                                                                {
                                                                    backgroundColor: isActive
                                                                        ? theme.primary
                                                                        : theme.inputBackground,
                                                                    borderColor: isActive
                                                                        ? theme.primary
                                                                        : theme.inputBorder,
                                                                },
                                                            ]}
                                                            onPress={() =>
                                                                setPricingByCount((current) => ({
                                                                    ...current,
                                                                    [count]: { price: entry.price, period },
                                                                }))
                                                            }
                                                            activeOpacity={0.7}
                                                        >
                                                            <Text
                                                                style={[
                                                                    styles.periodText,
                                                                    { color: isActive ? '#ffffff' : theme.text },
                                                                ]}
                                                            >
                                                                {period}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </View>
                                        </View>
                                    ))}
                            </View>
                        )}
                    </View>

                    {draft.buildings.map((building) => (
                        <View
                            key={building.id}
                            style={[styles.itemCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                        >
                            {editingBuildingId === building.id ? (
                                <View style={styles.editRow}
                                >
                                    <TextInput
                                        style={[
                                            styles.input,
                                            {
                                                flex: 1,
                                                backgroundColor: theme.inputBackground,
                                                borderColor: theme.inputBorder,
                                                color: theme.text,
                                            },
                                        ]}
                                        value={editingBuildingName}
                                        onChangeText={setEditingBuildingName}
                                        autoFocus
                                    />
                                    <TouchableOpacity
                                        style={[styles.addButton, { backgroundColor: theme.primary }]}
                                        onPress={handleSaveEditBuilding}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.addButtonText}>Save</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.cancelButton, { backgroundColor: theme.inputBackground }]}
                                        onPress={() => {
                                            setEditingBuildingId(null);
                                            setEditingBuildingName('');
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.itemRow}
                                >
                                    <View style={styles.itemLeft}
                                    >
                                        <View style={[styles.itemIcon, { backgroundColor: theme.primary + '15' }]}
                                        >
                                            <Building2 size={18} color={theme.primary} strokeWidth={2} />
                                        </View>
                                        <Text style={[styles.itemText, { color: theme.text }]}>{building.name}</Text>
                                    </View>
                                    <View style={styles.itemActions}
                                    >
                                        <TouchableOpacity
                                            style={[styles.smallButton, { backgroundColor: theme.inputBackground }]}
                                            onPress={() => handleStartEditBuilding(building)}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={[styles.smallButtonText, { color: theme.text }]}>Edit</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.smallButton, { backgroundColor: theme.error + '15' }]}
                                            onPress={() => handleRemoveBuilding(building.id)}
                                            activeOpacity={0.7}
                                        >
                                            <Trash2 size={16} color={theme.error} strokeWidth={2} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </View>
                    ))}
                </View>

                <View style={styles.section}
                >
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Edit Floors</Text>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.tabRow}
                    >
                        {draft.buildings.map((building) => {
                            const isSelected = building.id === selectedFloorBuildingId;
                            return (
                                <TouchableOpacity
                                    key={building.id}
                                    style={[
                                        styles.tab,
                                        {
                                            backgroundColor: isSelected ? theme.primary : theme.inputBackground,
                                            borderColor: isSelected ? theme.primary : theme.inputBorder,
                                        },
                                    ]}
                                    onPress={() => setSelectedFloorBuildingId(building.id)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.tabText, { color: isSelected ? '#ffffff' : theme.text }]}>
                                        {building.name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    {selectedFloorBuilding && (
                        <View style={styles.subSection}
                        >
                            <View style={styles.inputRow}
                            >
                                <TextInput
                                    style={[
                                        styles.input,
                                        {
                                            flex: 1,
                                            backgroundColor: theme.inputBackground,
                                            borderColor: theme.inputBorder,
                                            color: theme.text,
                                        },
                                    ]}
                                    placeholder="Floor label"
                                    placeholderTextColor={theme.textSecondary}
                                    value={newFloorLabel}
                                    onChangeText={setNewFloorLabel}
                                />
                                <TouchableOpacity
                                    style={[styles.addButton, { backgroundColor: theme.primary }]}
                                    onPress={handleAddFloor}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.addButtonText}>Add</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.list}
                            >
                                {selectedFloorBuilding.floors.map((floor) => (
                                    <FloorCard
                                        key={floor.id}
                                        floor={floor}
                                        onUpdate={(label) => handleUpdateFloor(floor.id, label)}
                                        onRemove={() => handleRemoveFloor(floor.id)}
                                    />
                                ))}
                            </View>
                        </View>
                    )}
                </View>

                <View style={styles.section}
                >
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Edit Rooms</Text>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.tabRow}
                    >
                        {draft.buildings.map((building) => {
                            const isSelected = building.id === selectedRoomBuildingId;
                            return (
                                <TouchableOpacity
                                    key={building.id}
                                    style={[
                                        styles.tab,
                                        {
                                            backgroundColor: isSelected ? theme.primary : theme.inputBackground,
                                            borderColor: isSelected ? theme.primary : theme.inputBorder,
                                        },
                                    ]}
                                    onPress={() => setSelectedRoomBuildingId(building.id)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.tabText, { color: isSelected ? '#ffffff' : theme.text }]}>
                                        {building.name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    {selectedRoomBuilding && (
                        <View style={styles.subSection}
                        >
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.tabRow}
                            >
                                {selectedRoomBuilding.floors.map((floor) => {
                                    const isSelected = floor.id === selectedRoomFloorId;
                                    return (
                                        <TouchableOpacity
                                            key={floor.id}
                                            style={[
                                                styles.tab,
                                                {
                                                    backgroundColor: isSelected ? theme.primary : theme.inputBackground,
                                                    borderColor: isSelected ? theme.primary : theme.inputBorder,
                                                },
                                            ]}
                                            onPress={() => setSelectedRoomFloorId(floor.id)}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={[styles.tabText, { color: isSelected ? '#ffffff' : theme.text }]}>
                                                Floor {floor.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>

                            {selectedRoomFloor && (
                                <View style={styles.roomSection}
                                >
                                    <View style={styles.field}
                                    >
                                        <Text style={[styles.label, { color: theme.text }]}>Room Number</Text>
                                        <TextInput
                                            style={[
                                                styles.input,
                                                {
                                                    backgroundColor: theme.inputBackground,
                                                    borderColor: theme.inputBorder,
                                                    color: theme.text,
                                                },
                                            ]}
                                            placeholder="e.g., 101"
                                            placeholderTextColor={theme.textSecondary}
                                            value={roomNumber}
                                            onChangeText={setRoomNumber}
                                        />
                                    </View>

                                    <View style={styles.field}
                                    >
                                        <Text style={[styles.label, { color: theme.text }]}>Bed Count</Text>
                                        <View style={styles.bedCountRow}
                                        >
                                            {availableBedCounts.map((count) => {
                                                const isSelected = count === selectedBedCount;
                                                return (
                                                    <TouchableOpacity
                                                        key={count}
                                                        style={[
                                                            styles.bedCountButton,
                                                            {
                                                                backgroundColor: isSelected
                                                                    ? theme.primary
                                                                    : theme.inputBackground,
                                                                borderColor: isSelected ? theme.primary : theme.inputBorder,
                                                            },
                                                        ]}
                                                        onPress={() => setSelectedBedCount(count)}
                                                        activeOpacity={0.7}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.bedCountText,
                                                                { color: isSelected ? '#ffffff' : theme.text },
                                                            ]}
                                                        >
                                                            {count}
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        style={[styles.addRoomButton, { backgroundColor: theme.primary }]}
                                        onPress={handleAddRoom}
                                        activeOpacity={0.7}
                                    >
                                        <DoorOpen size={18} color="#ffffff" strokeWidth={2} />
                                        <Text style={styles.addButtonText}>Add Room</Text>
                                    </TouchableOpacity>

                                    <View style={styles.list}
                                    >
                                        {selectedRoomFloor.rooms.map((room) => (
                                            <EditableRoomCard
                                                key={room.id}
                                                roomNumber={room.roomNumber}
                                                shareType={room.shareType}
                                                bedCount={room.bedCount ?? room.beds.length}
                                                onUpdate={(newNumber) => handleUpdateRoom(room.id, newNumber)}
                                                onRemove={() => handleRemoveRoom(room.id)}
                                            />
                                        ))}
                                    </View>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: theme.border }]}
            >
                <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: theme.accent }]}
                    onPress={handleSave}
                    activeOpacity={0.8}
                    disabled={isSaving || !draft.name.trim()}
                >
                    <Save size={18} color="#ffffff" strokeWidth={2} />
                    <Text style={styles.saveButtonText}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Text>
                </TouchableOpacity>
            </View>
            <ConfirmModal
                visible={!!confirmConfig}
                title={confirmConfig?.title ?? ''}
                message={confirmConfig?.message ?? ''}
                onCancel={() => setConfirmConfig(null)}
                onConfirm={() => {
                    const action = confirmConfig?.onConfirm;
                    setConfirmConfig(null);
                    action?.();
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 64,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backText: {
        fontSize: 14,
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    placeholder: {
        width: 64,
    },
    content: {
        padding: 20,
        gap: 24,
    },
    section: {
        gap: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    field: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 14,
        fontSize: 15,
    },
    readonlyBox: {
        height: 48,
        borderWidth: 1,
        borderRadius: 12,
        justifyContent: 'center',
        paddingHorizontal: 14,
    },
    readonlyText: {
        fontSize: 15,
        fontWeight: '500',
    },
    inputRow: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
    },
    addButton: {
        height: 48,
        paddingHorizontal: 14,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
    cancelButton: {
        height: 48,
        paddingHorizontal: 12,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    itemCard: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 12,
        gap: 12,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    itemIcon: {
        width: 36,
        height: 36,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemText: {
        fontSize: 15,
        fontWeight: '600',
        flex: 1,
    },
    itemActions: {
        flexDirection: 'row',
        gap: 8,
    },
    smallButton: {
        height: 34,
        minWidth: 50,
        paddingHorizontal: 10,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    smallButtonText: {
        fontSize: 13,
        fontWeight: '600',
    },
    editRow: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    tabRow: {
        gap: 10,
        paddingVertical: 4,
    },
    tab: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 2,
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
    },
    subSection: {
        gap: 12,
    },
    list: {
        gap: 12,
    },
    roomSection: {
        gap: 14,
    },
    pricingList: {
        gap: 12,
    },
    pricingCard: {
        gap: 10,
    },
    pricingLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    pricingInput: {
        height: 44,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        fontSize: 14,
    },
    emptyPricingText: {
        fontSize: 13,
    },
    periodRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    periodButton: {
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
    },
    periodText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    bedCountRow: {
        flexDirection: 'row',
        gap: 10,
    },
    bedCountButton: {
        width: 44,
        height: 40,
        borderRadius: 10,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bedCountText: {
        fontSize: 14,
        fontWeight: '600',
    },
    addRoomButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 48,
        borderRadius: 12,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
    },
    saveButton: {
        height: 52,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    saveButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
    },
    emptyContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
