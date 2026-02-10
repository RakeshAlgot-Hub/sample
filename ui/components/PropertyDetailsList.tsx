import { useEffect } from 'react';
import { useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import WizardTopHeader from '@/components/WizardTopHeader';
import { usePropertiesStore } from '@/store/usePropertiesStore';
import { Home, Plus, ChevronRight, Check } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

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
                        <Animated.View
                            entering={FadeInDown.springify()}
                            style={[
                                styles.iconContainer,
                                { backgroundColor: theme.primary + '15' },
                            ]}
                        >
                            <Home size={56} color={theme.primary} strokeWidth={2.5} />
                        </Animated.View>
                        <Text style={[styles.emptyTitle, { color: theme.text }]}>No Properties Yet</Text>
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}
                        >
                            Get started by creating your first property to manage your buildings, floors, rooms, and beds
                        </Text>
                        <TouchableOpacity
                            style={[styles.createButton, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                            onPress={handleCreateProperty}
                            activeOpacity={0.8}
                        >
                            <Plus size={22} color={theme.text} strokeWidth={2.5} />
                            <Text style={[styles.createButtonText, { color: theme.text }]}>Create Property</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <WizardTopHeader title="Properties" onBack={handleBack} showMenu={false} />
            <ScrollView 
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Property Switcher */}
                <Animated.View entering={FadeInDown.duration(300)} style={styles.switcherSection}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Select Property</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.switcherRow}
                    >
                        {properties.map((property, index) => {
                            const isActive = property.id === activeProperty?.id;
                            return (
                                <Animated.View
                                    key={property.id}
                                    entering={FadeIn.delay(index * 50)}
                                >
                                    <TouchableOpacity
                                        style={[
                                            styles.pill,
                                            {
                                                backgroundColor: theme.card,
                                                borderColor: isActive ? theme.primary : theme.cardBorder,
                                            },
                                        ]}
                                        onPress={() => handleSelectProperty(property.id)}
                                        activeOpacity={0.7}
                                    >
                                        <Home size={16} color={isActive ? theme.primary : theme.textSecondary} strokeWidth={2.5} />
                                        <Text style={[styles.pillText, { color: theme.text }]}>
                                            {property.name}
                                        </Text>
                                        {isActive && <Check size={16} color={theme.primary} strokeWidth={2.5} />}
                                    </TouchableOpacity>
                                </Animated.View>
                            );
                        })}
                    </ScrollView>
                </Animated.View>

                {activeProperty && (
                    <>
                        {/* Property Info Card */}
                        <Animated.View 
                            entering={FadeInDown.delay(100).springify()}
                            style={[styles.activeCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                        >
                            <View style={[styles.propertyHeader, { backgroundColor: theme.card, borderBottomColor: theme.cardBorder }]}>
                                <View style={[styles.headerIconContainer, { backgroundColor: theme.primary + '12' }]}>
                                    <Home size={28} color={theme.primary} strokeWidth={2.5} />
                                </View>
                                <View style={styles.headerTextContainer}>
                                    <Text style={[styles.propertyName, { color: theme.text }]}>{activeProperty.name}</Text>
                                    <Text style={[styles.propertyType, { color: theme.textSecondary }]}>{activeProperty.type}</Text>
                                </View>
                            </View>

                            {/* View Details Button */}
                            <TouchableOpacity
                                style={[styles.detailsButton, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                                onPress={() => handleOpenDetails(activeProperty.id)}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.detailsText, { color: theme.text }]}>View Full Details</Text>
                                <ChevronRight size={18} color={theme.textSecondary} strokeWidth={2.5} />
                            </TouchableOpacity>
                        </Animated.View>
                    </>
                )}

                {/* Create Property Button */}
                <Animated.View entering={FadeInDown.delay(200)}>
                    <TouchableOpacity
                        style={[styles.createButton, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                        onPress={handleCreateProperty}
                        activeOpacity={0.8}
                    >
                        <Plus size={22} color={theme.text} strokeWidth={2.5} />
                        <Text style={[styles.createButtonText, { color: theme.text }]}>Create New Property</Text>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
        paddingBottom: 100,
        gap: 24,
    },
    switcherSection: {
        gap: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    switcherRow: {
        gap: 12,
        paddingVertical: 4,
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 14,
        borderWidth: 1.5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    pillText: {
        fontSize: 14,
        fontWeight: '700',
    },
    emptyContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyCard: {
        padding: 32,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: 'center',
        gap: 16,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '800',
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 8,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 54,
        paddingHorizontal: 28,
        borderRadius: 14,
        gap: 10,
        alignSelf: 'stretch',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    createButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
    },
    activeCard: {
        borderRadius: 18,
        borderWidth: 1,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    propertyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        gap: 16,
        borderBottomWidth: 1,
    },
    headerIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTextContainer: {
        flex: 1,
        gap: 6,
    },
    propertyName: {
        fontSize: 20,
        fontWeight: '800',
        color: '#ffffff',
    },
    propertyType: {
        fontSize: 13,
        fontWeight: '600',
        color: '#ffffff',
        opacity: 0.9,
    },
    detailsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 14,
        borderWidth: 1,
    },
    detailsText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#ffffff',
    },
});
