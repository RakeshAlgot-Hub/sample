import { useMemo, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { useMembersStore } from '@/store/useMembersStore';
import WizardTopHeader from '@/components/WizardTopHeader';
import {
    addDays,
    addMonths,
    DEFAULT_PAYMENT_CYCLE,
    formatDateToISO,
    normalizePaymentCycle,
    parseDateInput,
} from '@/utils/memberPayments';

type PaymentStatus = 'paid' | 'due';

const getParam = (value?: string | string[]) =>
    Array.isArray(value) ? value[0] : value;

export default function MemberPaymentScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { addMember } = useMembersStore();
    const params = useLocalSearchParams<{
        name?: string;
        phone?: string;
        villageName?: string;
        joinedDate?: string;
        proofId?: string;
        profilePic?: string;
        propertyId?: string;
        buildingId?: string;
        floorId?: string;
        roomId?: string;
        bedId?: string;
        from?: string;
    }>();

    const name = getParam(params.name);
    const phone = getParam(params.phone);
    const villageName = getParam(params.villageName);
    const joinedDate = getParam(params.joinedDate);
    const proofId = getParam(params.proofId);
    const profilePic = getParam(params.profilePic);
    const propertyId = getParam(params.propertyId);
    const buildingId = getParam(params.buildingId);
    const floorId = getParam(params.floorId);
    const roomId = getParam(params.roomId);
    const bedId = getParam(params.bedId);

    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('paid');
    const [cycleUnit, setCycleUnit] = useState<'months' | 'days'>('months');
    const [cycleValue, setCycleValue] = useState('1');

    const joinedDateValue = useMemo(
        () => (joinedDate ? parseDateInput(joinedDate) : null),
        [joinedDate]
    );

    const normalizedCycle = useMemo(() => {
        const parsed = Number(cycleValue);
        if (!Number.isFinite(parsed) || parsed <= 0) {
            return 1;
        }
        return Math.floor(parsed);
    }, [cycleValue]);

    const nextDueDate = useMemo(() => {
        if (!joinedDateValue) {
            return '';
        }

        if (paymentStatus === 'due') {
            return formatDateToISO(joinedDateValue);
        }

        const computed =
            cycleUnit === 'months'
                ? addMonths(joinedDateValue, normalizedCycle)
                : addDays(joinedDateValue, normalizedCycle);
        return formatDateToISO(computed);
    }, [joinedDateValue, paymentStatus, cycleUnit, normalizedCycle]);

    const handleSave = useCallback(async () => {
        if (
            !name ||
            !phone ||
            !villageName ||
            !joinedDate ||
            !proofId ||
            !propertyId ||
            !buildingId ||
            !floorId ||
            !roomId ||
            !bedId
        ) {
            Alert.alert('Missing details', 'Please complete member details first.');
            router.back();
            return;
        }

        if (!joinedDateValue) {
            Alert.alert('Invalid date', 'Please provide a valid joined date.');
            router.back();
            return;
        }

        if (paymentStatus === 'paid' && normalizedCycle < 1) {
            Alert.alert('Invalid cycle', 'Payment cycle must be at least 1.');
            return;
        }

        const paymentCycle =
            paymentStatus === 'paid' && cycleUnit === 'months'
                ? normalizePaymentCycle(normalizedCycle)
                : DEFAULT_PAYMENT_CYCLE;

        const nextDue = nextDueDate || formatDateToISO(joinedDateValue);

        await addMember({
            id: Date.now().toString(),
            name,
            phone,
            villageName,
            joinedDate,
            payDate: joinedDate,
            paymentCycle,
            nextDueDate: nextDue,
            proofId,
            profilePic: profilePic || null,
            propertyId,
            buildingId,
            floorId,
            roomId,
            bedId,
            createdAt: new Date().toISOString(),
        });

        router.replace('/(tabs)/members');
    }, [
        addMember,
        bedId,
        buildingId,
        cycleUnit,
        floorId,
        joinedDate,
        joinedDateValue,
        name,
        nextDueDate,
        normalizedCycle,
        paymentStatus,
        phone,
        profilePic,
        proofId,
        propertyId,
        roomId,
        router,
        villageName,
    ]);

    const handleBack = useCallback(() => {
        router.back();
    }, [router]);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}
        >
            <WizardTopHeader title="Payment" onBack={handleBack} />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                >
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Status</Text>
                    <View
                        style={[
                            styles.segmentContainer,
                            { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder },
                        ]}
                    >
                        {(['paid', 'due'] as PaymentStatus[]).map((status) => {
                            const isActive = status === paymentStatus;
                            return (
                                <TouchableOpacity
                                    key={status}
                                    style={[
                                        styles.segmentButton,
                                        {
                                            backgroundColor: isActive ? theme.primary : 'transparent',
                                            borderColor: isActive ? theme.primary : 'transparent',
                                        },
                                    ]}
                                    onPress={() => setPaymentStatus(status)}
                                    activeOpacity={0.8}
                                >
                                    <Text
                                        style={[
                                            styles.segmentText,
                                            { color: isActive ? '#ffffff' : theme.text },
                                        ]}
                                    >
                                        {status === 'paid' ? 'Paid' : 'Due'}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {paymentStatus === 'paid' && (
                    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                    >
                        <Text style={[styles.cardTitle, { color: theme.text }]}>Cycle</Text>
                        <View style={styles.unitRow}>
                            {(['months', 'days'] as const).map((unit) => {
                                const isActive = unit === cycleUnit;
                                return (
                                    <TouchableOpacity
                                        key={unit}
                                        style={[
                                            styles.unitButton,
                                            {
                                                backgroundColor: isActive
                                                    ? theme.primary
                                                    : theme.inputBackground,
                                                borderColor: isActive ? theme.primary : theme.inputBorder,
                                            },
                                        ]}
                                        onPress={() => setCycleUnit(unit)}
                                        activeOpacity={0.8}
                                    >
                                        <Text
                                            style={[
                                                styles.unitText,
                                                { color: isActive ? '#ffffff' : theme.text },
                                            ]}
                                        >
                                            {unit === 'months' ? 'Months' : 'Days'}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        <View style={styles.fieldGroup}>
                            <Text style={[styles.label, { color: theme.text }]}>Length</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: theme.inputBackground,
                                        borderColor: theme.inputBorder,
                                        color: theme.text,
                                    },
                                ]}
                                placeholder="1"
                                placeholderTextColor={theme.textSecondary}
                                value={cycleValue}
                                onChangeText={(value) => setCycleValue(value.replace(/[^0-9]/g, ''))}
                                keyboardType="number-pad"
                                maxLength={3}
                            />
                        </View>
                    </View>
                )}

                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                >
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Next Due Date</Text>
                    <View
                        style={[
                            styles.readonlyField,
                            { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder },
                        ]}
                    >
                        <Text style={[styles.readonlyText, { color: theme.text }]}
                        >
                            {nextDueDate || 'Not available'}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, { backgroundColor: theme.accent }]}
                    onPress={handleSave}
                    activeOpacity={0.8}
                >
                    <Text style={styles.submitButtonText}>Save Member</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        gap: 14,
        paddingBottom: 100,
    },
    card: {
        borderRadius: 14,
        borderWidth: 1,
        padding: 14,
        gap: 12,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '700',
    },
    segmentContainer: {
        flexDirection: 'row',
        borderWidth: 1,
        borderRadius: 12,
        padding: 4,
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
        fontSize: 14,
        fontWeight: '700',
    },
    unitRow: {
        flexDirection: 'row',
        gap: 8,
    },
    unitButton: {
        flex: 1,
        height: 38,
        borderRadius: 10,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    unitText: {
        fontSize: 13,
        fontWeight: '600',
    },
    fieldGroup: {
        gap: 8,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
    },
    input: {
        height: 46,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        fontSize: 14,
    },
    readonlyField: {
        height: 46,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        justifyContent: 'center',
    },
    readonlyText: {
        fontSize: 14,
        fontWeight: '600',
    },
    submitButton: {
        height: 52,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
    },
    submitButtonText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '700',
    },
});
