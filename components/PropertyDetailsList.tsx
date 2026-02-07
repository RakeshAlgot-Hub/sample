import { useEffect } from 'react';
import { useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import WizardTopHeader from '@/components/WizardTopHeader';
import { usePropertiesStore } from '@/store/usePropertiesStore';
import { Home, Plus, ChevronRight, Check } from 'lucide-react-native';

export default function PropertyDetailsList() {
    const theme = useTheme();
    const router = useRouter();
    const pathname = usePathname();
    const { source } = useLocalSearchParams<{ source?: string }>();
    const { properties, activePropertyId, loadProperties, setActiveProperty } = usePropertiesStore();

    const isSettingsFlow = pathname.includes('/settings/');
    const isDashboardFlow = source === 'dashboard' || !isSettingsFlow;

    useEffect(() => {
        loadProperties();
    }, [loadProperties]);

    const handleBack = () => {
        if (isDashboardFlow) {
            router.back();
            return;
        }
        router.push('/(tabs)/settings');
    };

    const handleCreateProperty = () => {
        router.push('/wizard/property-details');
    };

    const activeProperty = useMemo(() => {
        if (activePropertyId) {
            return properties.find((property) => property.id === activePropertyId) ?? null;
        }
        return properties[0] ?? null;
    }, [activePropertyId, properties]);

    const handleSelectProperty = async (propertyId: string) => {
        if (propertyId !== activePropertyId) {
            await setActiveProperty(propertyId);
        }
    };

    const handleOpenDetails = (propertyId?: string | null) => {
        if (!propertyId) {
            return;
        }

        const params = isDashboardFlow
            ? { id: propertyId, source: 'dashboard' }
            : { id: propertyId };

        router.push({ pathname: '/settings/property-details/[id]', params });
    };

    if (properties.length === 0) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <WizardTopHeader title="Property Details" onBack={handleBack} showMenu={false} />
                <View style={styles.emptyContent}>
                    <View
                        style={[
                            styles.emptyCard,
                            { backgroundColor: theme.card, borderColor: theme.cardBorder },
                        ]}
                    >
                        <View
                            style={[
                                styles.iconContainer,
                                { backgroundColor: theme.primary + '15' },
                            ]}
                        >
                            <Home size={48} color={theme.primary} strokeWidth={2} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: theme.text }]}>No Properties Yet</Text>
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}
                        >
                            Get started by creating your first property
                        </Text>
                        <TouchableOpacity
                            style={[styles.createButton, { backgroundColor: theme.accent }]}
                            onPress={handleCreateProperty}
                            activeOpacity={0.8}
                        >
                            <Plus size={20} color="#ffffff" strokeWidth={2} />
                            <Text style={styles.createButtonText}>Create Property</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <WizardTopHeader title="Property Details" onBack={handleBack} showMenu={false} />
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.switcherSection}>
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Active Property</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.switcherRow}
                    >
                        {properties.map((property) => {
                            const isActive = property.id === activeProperty?.id;
                            return (
                                <TouchableOpacity
                                    key={property.id}
                                    style={[
                                        styles.pill,
                                        {
                                            backgroundColor: isActive ? theme.primary : theme.card,
                                            borderColor: isActive ? theme.primary : theme.cardBorder,
                                        },
                                    ]}
                                    onPress={() => handleSelectProperty(property.id)}
                                    activeOpacity={0.8}
                                >
                                    <Text
                                        style={[
                                            styles.pillText,
                                            { color: isActive ? theme.background : theme.text },
                                        ]}
                                    >
                                        {property.name}
                                    </Text>
                                    {isActive && <Check size={14} color={theme.background} strokeWidth={2} />}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {activeProperty && (
                    <View style={[styles.activeCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                    >
                        <View style={styles.activeHeader}
                        >
                            <View style={[styles.iconWrap, { backgroundColor: theme.primary + '15' }]}
                            >
                                <Home size={20} color={theme.primary} strokeWidth={2} />
                            </View>
                            <View style={styles.textWrap}>
                                <Text style={[styles.rowLabel, { color: theme.text }]}>{activeProperty.name}</Text>
                                <Text style={[styles.rowHint, { color: theme.textSecondary }]}
                                >
                                    {activeProperty.type}
                                    {activeProperty.city ? ` • ${activeProperty.city}` : ''}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={[styles.detailsButton, { borderColor: theme.border }]}
                            onPress={() => handleOpenDetails(activeProperty.id)}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.detailsText, { color: theme.text }]}>View details</Text>
                            <ChevronRight size={16} color={theme.textSecondary} strokeWidth={2} />
                        </TouchableOpacity>
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.createButton, { backgroundColor: theme.accent }]}
                    onPress={handleCreateProperty}
                    activeOpacity={0.8}
                >
                    <Plus size={20} color="#ffffff" strokeWidth={2} />
                    <Text style={styles.createButtonText}>Create Property</Text>
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
    switcherSection: {
        gap: 10,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    switcherRow: {
        gap: 10,
        paddingVertical: 4,
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
    },
    pillText: {
        fontSize: 13,
        fontWeight: '600',
    },
    emptyContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyCard: {
        padding: 28,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
        gap: 14,
        width: '100%',
        maxWidth: 400,
    },
    iconContainer: {
        width: 90,
        height: 90,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 6,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 46,
        paddingHorizontal: 22,
        borderRadius: 12,
        gap: 8,
        alignSelf: 'center',
    },
    createButtonText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '600',
    },
    activeCard: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        gap: 14,
    },
    activeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textWrap: {
        gap: 2,
    },
    rowLabel: {
        fontSize: 15,
        fontWeight: '600',
    },
    rowHint: {
        fontSize: 12,
        fontWeight: '500',
    },
    rowRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    detailsText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
