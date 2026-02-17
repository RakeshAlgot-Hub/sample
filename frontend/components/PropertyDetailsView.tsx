import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import {
    Alert,
    Platform,
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    TextInput,
    BackHandler,
} from 'react-native';
import { useRouter, useFocusEffect, useNavigation } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import WizardTopHeader from '@/components/WizardTopHeader';
import { usePropertiesStore } from '@/store/usePropertiesStore';
import { useWebBackHandler } from '@/hooks/useWebBackHandler';
import {
    Building2,
    DoorOpen,
    Home,
    Layers,
    MapPin,
    Pencil,
    Trash2,
    ChevronRight,
} from 'lucide-react-native';

interface PropertyDetailsViewProps {
  id: string;
  source?: string;
}

export default function PropertyDetailsView({ id, source }: PropertyDetailsViewProps) {
    const theme = useTheme();
    const router = useRouter();
    const navigation = useNavigation();
    const { properties, loadProperties, removeProperty, updateProperty } = usePropertiesStore();
    const [isEditing, setIsEditing] = useState(false);
    const [draftName, setDraftName] = useState('');
    const [draftCity, setDraftCity] = useState('');
    const isHandlingBack = useRef(false);

    useEffect(() => {
        loadProperties();
    }, [loadProperties]);

    const selectedProperty = useMemo(() => {
        if (!id) {
            return null;
        }
        return properties.find((property) => property.id === id) ?? null;
    }, [id, properties]);

    const isHostelProperty = selectedProperty?.type === 'Hostel/PG';

    const summary = useMemo(() => ({
        totalBuildings: Array.isArray(selectedProperty?.buildings) ? selectedProperty.buildings.length : 0,
        totalRooms: selectedProperty?.totalRooms ?? 0,
        totalBeds: selectedProperty?.totalBeds ?? 0,
    }), [selectedProperty]);

    const isDashboardFlow = source === 'dashboard';

    const handleBack = useCallback(() => {
        isHandlingBack.current = true;
        if (isDashboardFlow) {
            router.replace('/(tabs)');
            return;
        }
        router.replace('/settings/property-details' as '/settings/property-details/index');
    }, [isDashboardFlow, router]);

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                handleBack();
                return true;
            };

            const subscription = BackHandler.addEventListener(
                'hardwareBackPress',
                onBackPress,
            );

            const beforeRemove = navigation.addListener('beforeRemove', (event) => {
                if (isHandlingBack.current) {
                    return;
                }
                event.preventDefault();
                handleBack();
            });

            return () => {
                subscription.remove();
                beforeRemove();
            };
        }, [handleBack, navigation]),
    );

    useWebBackHandler(handleBack);

    const handleEditProperty = () => {
        if (!selectedProperty) {
            return;
        }

        if (!isEditing) {
            setDraftName(selectedProperty.name ?? '');
            setDraftCity(selectedProperty.city ?? '');
        }

        setIsEditing((prev) => !prev);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setDraftName('');
        setDraftCity('');
    };

    const handleSaveEdit = async () => {
        if (!selectedProperty) {
            return;
        }

        const nextName = draftName.trim();
        if (!nextName) {
            Alert.alert('Invalid name', 'Property name is required.');
            return;
        }

        await updateProperty(selectedProperty.id, {
            name: nextName,
            city: draftCity.trim(),
        });

        setIsEditing(false);
    };

    const handleDeleteProperty = async () => {
        if (!selectedProperty) {
            return;
        }

        const label = `Delete ${selectedProperty.name}?`;

        const confirm = () => {
            void removeProperty(selectedProperty.id);
            handleBack();
        };

        if (Platform.OS === 'web') {
            const confirmed = typeof window !== 'undefined' ? window.confirm(label) : true;
            if (confirmed) {
                confirm();
            }
            return;
        }

        Alert.alert('Delete Property', label, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: confirm },
        ]);
    };

    if (!selectedProperty) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}> 
                <View style={styles.emptyContent}>
                    <Text style={[styles.emptyTitle, { color: theme.text }]}>Property not found</Text>
                    <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Select a property to view its details.</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}> 
            <ScrollView contentContainerStyle={styles.content}>
                <View style={[styles.headerCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}> 
                    <View style={styles.headerTop}> 
                        <View style={styles.headerInfo}> 
                            <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }]}> 
                                <Home size={34} color={theme.primary} strokeWidth={2} />
                            </View>
                            <View style={styles.propertyInfo}> 
                                {isEditing ? (
                                    <View style={styles.editFields}> 
                                        <TextInput style={[styles.input, { borderColor: theme.border, color: theme.text }]} value={draftName} onChangeText={setDraftName} placeholder="Property name" placeholderTextColor={theme.textSecondary} />
                                        <TextInput style={[styles.input, { borderColor: theme.border, color: theme.text }]} value={draftCity} onChangeText={setDraftCity} placeholder="City" placeholderTextColor={theme.textSecondary} />
                                    </View>
                                ) : (
                                    <>
                                        <Text style={[styles.propertyName, { color: theme.text }]}>{selectedProperty.name}</Text>
                                        <View style={styles.pillRow}> 
                                            <View style={[styles.pill, { backgroundColor: theme.primary + '15', borderColor: theme.primary + '40' }]}> 
                                                <Text style={[styles.pillText, { color: theme.primary }]}>{selectedProperty.type}</Text>
                                            </View>
                                            {selectedProperty.city && (
                                                <View style={[styles.pill, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}> 
                                                    <MapPin size={12} color={theme.textSecondary} strokeWidth={2} />
                                                    <Text style={[styles.pillText, { color: theme.textSecondary }]}>{selectedProperty.city}</Text>
                                                </View>
                                            )}
                                        </View>
                                    </>
                                )}
                            </View>
                        </View>
                        {!isEditing && (
                            <TouchableOpacity style={[styles.editIconButton, { borderColor: theme.border }]} onPress={handleEditProperty} activeOpacity={0.7}>
                                <Pencil size={16} color={theme.textSecondary} strokeWidth={2} />
                            </TouchableOpacity>
                        )}
                    </View>
                    {!isEditing && (
                        <View style={[styles.summaryRow, { borderColor: theme.border }]}> 
                            <View style={styles.summaryItem}> 
                                <Text style={[styles.summaryValue, { color: theme.text }]}>{summary.totalBuildings}</Text>
                                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Buildings</Text>
                            </View>
                            <View style={styles.summaryItem}> 
                                <Text style={[styles.summaryValue, { color: theme.text }]}>{summary.totalRooms}</Text>
                                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Rooms</Text>
                            </View>
                            <View style={styles.summaryItem}> 
                                <Text style={[styles.summaryValue, { color: theme.text }]}>{summary.totalBeds}</Text>
                                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Beds</Text>
                            </View>
                        </View>
                    )}
                    {isEditing && (
                        <View style={styles.editActions}> 
                            <TouchableOpacity style={[styles.cancelButton, { borderColor: theme.border }]} onPress={handleCancelEdit} activeOpacity={0.7}>
                                <Text style={[styles.cancelText, { color: theme.text }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.primary }]} onPress={handleSaveEdit} activeOpacity={0.8}>
                                <Text style={styles.saveText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {!isHostelProperty && (
                    <View style={[styles.noticeCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}> 
                        <Text style={[styles.noticeTitle, { color: theme.text }]}>Limited for Apartments</Text>
                        <Text style={[styles.noticeText, { color: theme.textSecondary }]}>Buildings, floors, rooms, and beds management is available only for Hostel/PG properties.</Text>
                    </View>
                )}


                {/* Manage section: always show all manage options together */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Manage</Text>
                    <View style={styles.list}>
                        {isHostelProperty && (
                            <>
                                <View style={[styles.optionRow, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}> 
                                    <TouchableOpacity style={styles.optionLeft} onPress={() => router.push({ pathname: '/properties/[id]/buildings', params: { id } })} activeOpacity={0.7}>
                                        <Building2 size={18} color={theme.primary} strokeWidth={2} />
                                        <Text style={[styles.optionLabel, { color: theme.text }]}>Manage Buildings</Text>
                                    </TouchableOpacity>
                                    <View style={styles.optionActions}> 
                                        <ChevronRight size={18} color={theme.textSecondary} strokeWidth={2} />
                                    </View>
                                </View>
                                <View style={[styles.optionRow, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}> 
                                    <TouchableOpacity style={styles.optionLeft} onPress={() => router.push({ pathname: '/properties/[id]/rooms', params: { id } })} activeOpacity={0.7}>
                                        <DoorOpen size={18} color={theme.primary} strokeWidth={2} />
                                        <Text style={[styles.optionLabel, { color: theme.text }]}>Manage Rooms</Text>
                                    </TouchableOpacity>
                                    <View style={styles.optionActions}> 
                                        <ChevronRight size={18} color={theme.textSecondary} strokeWidth={2} />
                                    </View>
                                </View>
                            </>
                        )}
                        <View style={[styles.optionRow, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}> 
                            <TouchableOpacity style={styles.optionLeft} onPress={() => router.push({ pathname: '/properties/[id]/switch-property', params: { id } })} activeOpacity={0.7}>
                                <Home size={18} color={theme.primary} strokeWidth={2} />
                                <Text style={[styles.optionLabel, { color: theme.text }]}>Manage Properties</Text>
                            </TouchableOpacity>
                            <View style={styles.optionActions}> 
                                <ChevronRight size={18} color={theme.textSecondary} strokeWidth={2} />
                            </View>
                        </View>
                    </View>
                </View>

                <TouchableOpacity style={[styles.deleteButton, { borderColor: theme.error + '40' }]} onPress={handleDeleteProperty} activeOpacity={0.8}>
                    <Trash2 size={16} color={theme.error} strokeWidth={2} />
                    <Text style={[styles.deleteText, { color: theme.error }]}>Delete property</Text>
                </TouchableOpacity>
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
        gap: 18,
    },
    emptyContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    emptyText: {
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 18,
        marginTop: 6,
    },
    backButton: {
        marginTop: 16,
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
    },
    backText: {
        fontSize: 14,
        fontWeight: '600',
    },
    headerCard: {
        padding: 18,
        borderRadius: 18,
        borderWidth: 1,
        gap: 16,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 14,
    },
    headerInfo: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 14,
        flex: 1,
    },
    iconContainer: {
        width: 90,
        height: 90,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    propertyInfo: {
        flex: 1,
        gap: 8,
    },
    propertyName: {
        fontSize: 18,
        fontWeight: '700',
    },
    editFields: {
        gap: 10,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        fontWeight: '600',
    },
    editIconButton: {
        width: 34,
        height: 34,
        borderRadius: 10,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pillRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
    },
    pillText: {
        fontSize: 12,
        fontWeight: '600',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        paddingTop: 14,
    },
    summaryItem: {
        alignItems: 'center',
        flex: 1,
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    summaryLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 2,
    },
    editActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
    },
    cancelButton: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
    },
    cancelText: {
        fontSize: 13,
        fontWeight: '600',
    },
    saveButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
    },
    saveText: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '700',
    },
    section: {
        gap: 10,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.6,
        textTransform: 'uppercase',
    },
    list: {
        gap: 10,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        gap: 12,
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    optionLabel: {
        fontSize: 15,
        fontWeight: '600',
    },
    optionActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    noticeCard: {
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        gap: 6,
    },
    noticeTitle: {
        fontSize: 15,
        fontWeight: '700',
    },
    noticeText: {
        fontSize: 13,
        lineHeight: 18,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginTop: 6,
    },
    deleteText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
