import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Member } from '@/types/member';
import { normalizeMemberPaymentFields } from '@/utils/memberPayments';

interface MembersStore {
  members: Member[];
  addMember: (member: Member) => Promise<void>;
  removeMember: (id: string) => Promise<void>;
  updateMember: (id: string, updates: Partial<Member>) => Promise<void>;
  loadMembersByProperty: (propertyId: string) => Promise<void>;
  saveMembers: () => Promise<void>;
  clearMembers: () => void;
  reset: () => void;
}

export const useMembersStore = create<MembersStore>((set, get) => ({
  members: [],

  addMember: async (member: Member) => {
    set((state) => ({
      members: [...state.members, member],
    }));
    await get().saveMembers();
  },

  removeMember: async (id: string) => {
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

  loadMembersByProperty: async (propertyId: string) => {
    try {
      const savedMembers = await AsyncStorage.getItem('members');
      if (savedMembers) {
        const allMembers: Member[] = JSON.parse(savedMembers);
        const filtered = allMembers.filter(m => m.propertyId === propertyId);
        set({ members: filtered.map(normalizeMemberPaymentFields) });
      } else {
        set({ members: [] });
      }
    } catch (error) {
      console.error('Failed to load members by property:', error);
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

  clearMembers: () => {
    set({ members: [] });
  },

  reset: () => {
    set({ members: [] });
  },
}));
