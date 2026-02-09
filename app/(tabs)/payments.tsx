import { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
} from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { useMembersStore } from '@/store/useMembersStore';
import { usePropertiesStore } from '@/store/usePropertiesStore';
import MemberCard from '@/components/MemberCard';
import { getMemberPaymentStatus, PaymentStatus } from '@/utils/memberPayments';
import { CalendarClock } from 'lucide-react-native';

export default function PaymentsScreen() {
    const theme = useTheme();
    const { members, loadMembers, removeMember } = useMembersStore();
    const { activePropertyId, loadProperties } = usePropertiesStore();
    const [paymentFilter, setPaymentFilter] = useState<PaymentStatus>('paid');

    useEffect(() => {
        loadMembers();
        loadProperties();
    }, []);

    const paymentFilters = useMemo(
        () => [
            { label: 'Paid', value: 'paid' as const },
            { label: 'Due', value: 'due' as const },
            { label: 'Upcoming', value: 'upcoming' as const },
        ],
        []
    );

    const baseMembers = useMemo(() => {
        return activePropertyId
            ? members.filter((member) => member.propertyId === activePropertyId)
            : members;
    }, [activePropertyId, members]);

    const filteredMembers = useMemo(() => {
        return baseMembers.filter(
            (member) => getMemberPaymentStatus(member) === paymentFilter
        );
    }, [baseMembers, paymentFilter]);


    const handleRemoveMember = async (id: string) => {
        await removeMember(id);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.headerBlock}>
                <View style={styles.headerRow}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Payments</Text>
                    <View style={[styles.headerIcon, { backgroundColor: theme.primary + '15' }]}
                    >
                        <CalendarClock size={18} color={theme.primary} />
                    </View>
                </View>
                <Text style={[styles.headerMeta, { color: theme.textSecondary }]}
                >
                    {filteredMembers.length} members
                </Text>
            </View>

            <View
                style={[
                    styles.segmentContainer,
                    { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder },
                ]}
            >
                {paymentFilters.map((filter) => {
                    const isActive = paymentFilter === filter.value;
                    return (
                        <TouchableOpacity
                            key={filter.value}
                            style={[
                                styles.segmentButton,
                                {
                                    backgroundColor: isActive ? theme.primary : 'transparent',
                                    borderColor: isActive ? theme.primary : 'transparent',
                                },
                            ]}
                            onPress={() => setPaymentFilter(filter.value)}
                            activeOpacity={0.8}
                        >
                            <Text
                                style={[
                                    styles.segmentText,
                                    { color: isActive ? '#ffffff' : theme.text },
                                ]}
                            >
                                {filter.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
            <FlatList
                data={filteredMembers}
                keyExtractor={(member) => member.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <MemberCard member={item} onRemove={() => handleRemoveMember(item.id)} />
                )}
                ListEmptyComponent={
                    <View
                        style={[
                            styles.filterEmptyCard,
                            { backgroundColor: theme.card, borderColor: theme.cardBorder },
                        ]}
                    >
                        <Text style={[styles.filterEmptyTitle, { color: theme.text }]}>No matches</Text>
                        <Text style={[styles.filterEmptyText, { color: theme.textSecondary }]}
                        >
                            No members found for the selected payment status.
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerBlock: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 4,
        gap: 6,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    headerIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerMeta: {
        fontSize: 12,
        fontWeight: '600',
    },
    segmentContainer: {
        marginTop: 14,
        marginHorizontal: 16,
        borderWidth: 1,
        borderRadius: 14,
        padding: 4,
        flexDirection: 'row',
        gap: 4,
    },
    segmentButton: {
        flex: 1,
        height: 40,
        borderRadius: 10,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    segmentText: {
        fontSize: 13,
        fontWeight: '700',
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
        gap: 14,
    },
    filterEmptyCard: {
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
        gap: 8,
    },
    filterEmptyTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    filterEmptyText: {
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 18,
    },
});
