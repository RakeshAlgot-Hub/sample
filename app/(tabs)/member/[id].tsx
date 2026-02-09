import { useEffect, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '@/theme/useTheme';
import { useMembersStore } from '@/store/useMembersStore';
import { usePropertiesStore } from '@/store/usePropertiesStore';
import WizardTopHeader from '@/components/WizardTopHeader';
import { User, Phone, Home, Building2, DoorOpen, MapPin, Calendar, BadgeCheck } from 'lucide-react-native';

export default function MemberDetailsScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id?: string }>();
    const { members, loadMembers } = useMembersStore();
    const { properties, loadProperties } = usePropertiesStore();

    useEffect(() => {
        loadMembers();
        loadProperties();
    }, []);

    const member = useMemo(() => {
        if (!id) {
            return null;
        }
        return members.find((item) => item.id === id) ?? null;
    }, [members, id]);

    const bedSummary = useMemo(() => {
        if (!member?.propertyId || !member.buildingId || !member.floorId || !member.roomId) {
            return null;
        }

        const property = properties.find((p) => p.id === member.propertyId);
        const building = property?.buildings.find((b) => b.id === member.buildingId);
        const floor = building?.floors.find((f) => f.id === member.floorId);
        const room = floor?.rooms.find((r) => r.id === member.roomId);
        const bedIndex = room?.beds.findIndex((b) => b.id === member.bedId) ?? -1;

        return {
            propertyName: property?.name ?? 'Property',
            buildingName: building?.name ?? 'Building',
            floorLabel: floor?.label ?? 'Floor',
            roomNumber: room?.roomNumber ?? 'Room',
            bedNumber: bedIndex >= 0 ? bedIndex + 1 : null,
        };
    }, [member, properties]);

    const handleBack = useCallback(() => {
        router.back();
    }, [router]);

    const handleCopyPhone = async () => {
        if (!member?.phone) {
            return;
        }

        await Clipboard.setStringAsync(member.phone);
        Alert.alert('Copied', 'Phone number copied. You can call now.');
    };

    if (!member) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <WizardTopHeader title="Member Details" onBack={handleBack} showMenu={false} />
                <View style={styles.emptyState}>
                    <Text style={[styles.emptyTitle, { color: theme.text }]}>Member not found</Text>
                    <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                        Please go back and select another member.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <WizardTopHeader title="Member Details" onBack={handleBack} showMenu={false} />
            <ScrollView contentContainerStyle={styles.content}>
                <View style={[styles.headerCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <View style={styles.headerRow}>
                        <View style={[styles.avatar, { backgroundColor: theme.primary + '15' }]}>
                            {member.profilePic ? (
                                <Image source={{ uri: member.profilePic }} style={styles.avatarImage} />
                            ) : (
                                <User size={32} color={theme.primary} strokeWidth={2} />
                            )}
                        </View>
                        <View style={styles.headerDetails}>
                            <Text style={[styles.memberName, { color: theme.text }]}>{member.name}</Text>
                            <Text style={[styles.memberMeta, { color: theme.textSecondary }]}>Profile</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.phoneCard, { borderColor: theme.cardBorder, backgroundColor: theme.secondary }]}
                        onPress={handleCopyPhone}
                        activeOpacity={0.7}
                    >
                        <View style={styles.phoneRow}>
                            <Phone size={16} color={theme.textSecondary} strokeWidth={2} />
                            <Text style={[styles.phoneText, { color: theme.text }]}>{member.phone}</Text>
                        </View>
                        <Text style={[styles.phoneHint, { color: theme.textSecondary }]}>Tap to copy. You can call now.</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <View style={styles.sectionHeader}>
                        <Home size={18} color={theme.textSecondary} strokeWidth={2} />
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Assignment</Text>
                    </View>
                    {bedSummary ? (
                        <View style={styles.detailStack}>
                            <View style={styles.detailRow}>
                                <Building2 size={16} color={theme.textSecondary} strokeWidth={2} />
                                <Text style={[styles.detailText, { color: theme.text }]}>
                                    {bedSummary.propertyName}
                                </Text>
                            </View>
                            <View style={styles.detailRow}>
                                <DoorOpen size={16} color={theme.textSecondary} strokeWidth={2} />
                                <Text style={[styles.detailText, { color: theme.text }]}>
                                    {bedSummary.buildingName} · Floor {bedSummary.floorLabel} · Room {bedSummary.roomNumber}
                                </Text>
                            </View>
                            <View style={styles.detailRow}>
                                <BadgeCheck size={16} color={theme.success} strokeWidth={2} />
                                <Text style={[styles.detailText, { color: theme.success }]}>
                                    Bed {bedSummary.bedNumber ?? '-'}
                                </Text>
                            </View>
                        </View>
                    ) : (
                        <Text style={[styles.detailText, { color: theme.textSecondary }]}>No bed assigned.</Text>
                    )}
                </View>

                <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <View style={styles.sectionHeader}>
                        <User size={18} color={theme.textSecondary} strokeWidth={2} />
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Profile Details</Text>
                    </View>
                    <View style={styles.detailStack}>
                        <View style={styles.detailRow}>
                            <MapPin size={16} color={theme.textSecondary} strokeWidth={2} />
                            <Text style={[styles.detailText, { color: theme.text }]}>
                                {member.villageName || 'Not provided'}
                            </Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Calendar size={16} color={theme.textSecondary} strokeWidth={2} />
                            <Text style={[styles.detailText, { color: theme.text }]}>
                                {member.joinedDate || 'Not provided'}
                            </Text>
                        </View>
                        <View style={styles.detailRow}>
                            <BadgeCheck size={16} color={theme.textSecondary} strokeWidth={2} />
                            <Text style={[styles.detailText, { color: theme.text }]}>
                                {member.proofId || 'Not provided'}
                            </Text>
                        </View>
                    </View>
                </View>
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
    headerCard: {
        borderRadius: 18,
        borderWidth: 1,
        padding: 16,
        gap: 14,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerDetails: {
        gap: 4,
    },
    memberName: {
        fontSize: 20,
        fontWeight: '700',
    },
    memberMeta: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    phoneCard: {
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 6,
    },
    phoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    phoneText: {
        fontSize: 15,
        fontWeight: '700',
    },
    phoneHint: {
        fontSize: 12,
        fontWeight: '600',
    },
    sectionCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        gap: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
    },
    detailStack: {
        gap: 10,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        fontSize: 13,
        fontWeight: '600',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        gap: 8,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    emptyText: {
        fontSize: 13,
        textAlign: 'center',
    },
});
