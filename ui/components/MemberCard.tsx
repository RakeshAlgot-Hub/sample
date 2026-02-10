import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Member } from '@/types/member';
import { useTheme } from '@/theme/useTheme';
import { usePropertiesStore } from '@/store/usePropertiesStore';
import ConfirmModal from '@/components/ConfirmModal';
import { User, Phone, Bed, Trash2, Home, Building2 } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';

interface MemberCardProps {
  member: Member;
  onRemove: () => void;
}

export default function MemberCard({ member, onRemove }: MemberCardProps) {
  const theme = useTheme();
  const router = useRouter();
  const { properties } = usePropertiesStore();
  const [confirmVisible, setConfirmVisible] = useState(false);

  const property = properties.find((p) => p.id === member.propertyId);
  const building = property?.buildings.find((b) => b.id === member.buildingId);
  const floor = building?.floors.find((f) => f.id === member.floorId);
  const room = floor?.rooms.find((r) => r.id === member.roomId);

  const handleRemove = () => {
    setConfirmVisible(true);
  };

  const handleOpenDetails = () => {
    router.push({ pathname: '/member/[id]', params: { id: member.id } });
  };

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      layout={Layout.springify()}
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.cardBorder },
      ]}
    >
      <TouchableOpacity
        style={styles.memberInfo}
        onPress={handleOpenDetails}
        activeOpacity={0.7}
      >
        <View style={[styles.avatar, { backgroundColor: theme.primary + '15' }]}>
          <User size={24} color={theme.primary} strokeWidth={2} />
        </View>
        <View style={styles.memberDetails}>
          <Text style={[styles.name, { color: theme.text }]}>
            {member.name}
          </Text>
          <View style={styles.phoneRow}>
            <Phone size={14} color={theme.textSecondary} strokeWidth={2} />
            <Text style={[styles.phone, { color: theme.textSecondary }]}>
              {member.phone}
            </Text>
          </View>
          {property && building && room && member.bedId && (
            <View style={styles.bedInfo}>
              <View style={styles.bedRow}>
                <Home size={12} color={theme.textSecondary} strokeWidth={2} />
                <Text style={[styles.bedText, { color: theme.textSecondary }]}>
                  {property.name}
                </Text>
              </View>
              <View style={styles.bedRow}>
                <Building2 size={12} color={theme.textSecondary} strokeWidth={2} />
                <Text style={[styles.bedText, { color: theme.textSecondary }]}>
                  {building.name} • Floor {floor?.label} • Room {room.roomNumber}
                </Text>
              </View>
              <View style={styles.bedRow}>
                <Bed size={12} color={theme.success} strokeWidth={2} />
                <Text style={[styles.bedText, { color: theme.success }]}>
                  Bed {member.bedId}
                </Text>
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleRemove}
        style={[styles.removeButton, { backgroundColor: theme.error + '15' }]}
        activeOpacity={0.7}
      >
        <Trash2 size={20} color={theme.error} strokeWidth={2} />
      </TouchableOpacity>
      <ConfirmModal
        visible={confirmVisible}
        title="Remove Member"
        message={`Are you sure you want to remove ${member.name}? This will free their assigned bed.`}
        onCancel={() => setConfirmVisible(false)}
        onConfirm={() => {
          setConfirmVisible(false);
          onRemove();
        }}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  memberInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
  name: {
    fontSize: 17,
    fontWeight: '700',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  phone: {
    fontSize: 13,
    fontWeight: '500',
  },
  bedInfo: {
    gap: 3,
    marginTop: 2,
  },
  bedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  bedText: {
    fontSize: 11,
    fontWeight: '600',
  },
  removeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
