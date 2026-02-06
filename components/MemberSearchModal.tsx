import { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Pressable,
    ScrollView,
    Platform,
} from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { useMembersStore } from '@/store/useMembersStore';
import { usePropertiesStore } from '@/store/usePropertiesStore';
import { Search, X, User, Phone, Bed, Home, Building2 } from 'lucide-react-native';

interface MemberSearchModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function MemberSearchModal({ visible, onClose }: MemberSearchModalProps) {
    const theme = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const { members } = useMembersStore();
    const { properties, activePropertyId } = usePropertiesStore();
    const webInputStyle = Platform.OS === 'web'
        ? ({ outlineStyle: 'none', boxShadow: 'none' } as any)
        : undefined;

    const filteredMembers = members.filter((member) => {
        const matchesQuery =
            member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.phone.includes(searchQuery);

        if (!matchesQuery) {
            return false;
        }

        if (!activePropertyId) {
            return true;
        }

        return member.propertyId === activePropertyId;
    });

    const getMemberLocation = (member: typeof members[0]) => {
        const property = properties.find((p) => p.id === member.propertyId);
        const building = property?.buildings.find((b) => b.id === member.buildingId);
        const floor = building?.floors.find((f) => f.id === member.floorId);
        const room = floor?.rooms.find((r) => r.id === member.roomId);

        return { property, building, floor, room };
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
            presentationStyle="pageSheet"
        >
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                    <View style={[styles.searchContainer, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
                        <Search size={20} color={theme.textSecondary} strokeWidth={2} />
                        <TextInput
                            style={[styles.searchInput, { color: theme.text }, webInputStyle]}
                            placeholder="Search members by name or phone..."
                            placeholderTextColor={theme.textSecondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            underlineColorAndroid="transparent"
                            autoFocus
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
                                <X size={18} color={theme.textSecondary} strokeWidth={2} />
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.closeText, { color: theme.accent }]}>Cancel</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.results}>
                    {searchQuery.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Search size={48} color={theme.textSecondary} strokeWidth={2} />
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                                Start typing to search members
                            </Text>
                        </View>
                    ) : filteredMembers.length === 0 ? (
                        <View style={styles.emptyState}>
                            <User size={48} color={theme.textSecondary} strokeWidth={2} />
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                                No members found
                            </Text>
                        </View>
                    ) : (
                        filteredMembers.map((member) => {
                            const { property, building, floor, room } = getMemberLocation(member);

                            return (
                                <View
                                    key={member.id}
                                    style={[styles.resultCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                                >
                                    <View style={styles.memberInfo}>
                                        <View style={[styles.avatar, { backgroundColor: theme.primary + '15' }]}>
                                            <User size={24} color={theme.primary} strokeWidth={2} />
                                        </View>
                                        <View style={styles.memberDetails}>
                                            <Text style={[styles.memberName, { color: theme.text }]}>
                                                {member.name}
                                            </Text>
                                            <View style={styles.infoRow}>
                                                <Phone size={14} color={theme.textSecondary} strokeWidth={2} />
                                                <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                                                    {member.phone}
                                                </Text>
                                            </View>
                                            {property && building && room && member.bedId && (
                                                <View style={styles.locationInfo}>
                                                    <View style={styles.infoRow}>
                                                        <Home size={12} color={theme.textSecondary} strokeWidth={2} />
                                                        <Text style={[styles.locationText, { color: theme.textSecondary }]}>
                                                            {property.name}
                                                        </Text>
                                                    </View>
                                                    <View style={styles.infoRow}>
                                                        <Building2 size={12} color={theme.textSecondary} strokeWidth={2} />
                                                        <Text style={[styles.locationText, { color: theme.textSecondary }]}>
                                                            {building.name} • Floor {floor?.label} • Room {room.roomNumber}
                                                        </Text>
                                                    </View>
                                                    <View style={styles.infoRow}>
                                                        <Bed size={12} color={theme.success} strokeWidth={2} />
                                                        <Text style={[styles.locationText, { color: theme.success }]}>
                                                            Bed {member.bedId}
                                                        </Text>
                                                    </View>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            );
                        })
                    )}
                </ScrollView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        height: 44,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        paddingVertical: 8,
    },
    closeButton: {
        paddingVertical: 8,
    },
    closeText: {
        fontSize: 15,
        fontWeight: '600',
    },
    results: {
        padding: 16,
        gap: 12,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
        gap: 12,
    },
    emptyText: {
        fontSize: 15,
        textAlign: 'center',
    },
    resultCard: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 14,
    },
    memberInfo: {
        flexDirection: 'row',
        gap: 10,
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
    },
    memberDetails: {
        flex: 1,
        gap: 5,
    },
    memberName: {
        fontSize: 17,
        fontWeight: '700',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    infoText: {
        fontSize: 13,
        fontWeight: '500',
    },
    locationInfo: {
        gap: 3,
        marginTop: 2,
    },
    locationText: {
        fontSize: 11,
        fontWeight: '600',
    },
});
