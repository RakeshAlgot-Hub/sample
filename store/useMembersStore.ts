import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Member } from '@/types/member';
import { usePropertiesStore } from './usePropertiesStore';
import { normalizeMemberPaymentFields } from '@/utils/memberPayments';

interface MembersStore {
  members: Member[];
  addMember: (member: Member) => Promise<void>;
  removeMember: (id: string) => Promise<void>;
  updateMember: (id: string, updates: Partial<Member>) => Promise<void>;
  loadMembers: () => Promise<void>;
  saveMembers: () => Promise<void>;
  reset: () => void;
}

export const useMembersStore = create<MembersStore>((set, get) => ({
  members: [],

  addMember: async (member: Member) => {
    if (
      member.propertyId &&
      member.buildingId &&
      member.floorId &&
      member.roomId &&
      member.bedId
    ) {
      const { updateBedOccupancy } = usePropertiesStore.getState();
      await updateBedOccupancy(
        member.propertyId,
        member.buildingId,
        member.floorId,
        member.roomId,
        member.bedId,
        true
      );
    }

    set((state) => ({
      members: [...state.members, member],
    }));
    await get().saveMembers();
  },

  removeMember: async (id: string) => {
    const member = get().members.find((m) => m.id === id);

    if (
      member &&
      member.propertyId &&
      member.buildingId &&
      member.floorId &&
      member.roomId &&
      member.bedId
    ) {
      const { updateBedOccupancy } = usePropertiesStore.getState();
      await updateBedOccupancy(
        member.propertyId,
        member.buildingId,
        member.floorId,
        member.roomId,
        member.bedId,
        false
      );
    }

    set((state) => ({
      members: state.members.filter((m) => m.id !== id),
    }));
    await get().saveMembers();
  },

  updateMember: async (id: string, updates: Partial<Member>) => {
    set((state) => ({
      members: state.members.map((m) =>
        m.id === id ? normalizeMemberPaymentFields({ ...m, ...updates }) : m
      ),
    }));
    await get().saveMembers();
  },

  loadMembers: async () => {
    try {
      const savedMembers = await AsyncStorage.getItem('members');
      if (savedMembers) {
        const members: Member[] = JSON.parse(savedMembers);
        set({ members: members.map(normalizeMemberPaymentFields) });
      }
    } catch (error) {
      console.error('Failed to load members:', error);
    }
  },

  saveMembers: async () => {
    try {
      const { members } = get();
      await AsyncStorage.setItem('members', JSON.stringify(members));
    } catch (error) {
      console.error('Failed to save members:', error);
    }
  },

  reset: () => {
    set({ members: [] });
  },
}));
