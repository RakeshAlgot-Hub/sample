import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as memberService from '@/services/memberService';
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
    const created = await memberService.createMember(member);
    set((state) => ({
      members: [...state.members, created],
    }));
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
    await memberService.deleteMember(id);
    set((state) => ({
      members: state.members.filter((m) => m.id !== id),
    }));
  },

  updateMember: async (id: string, updates: Partial<Member>) => {
    const updated = await memberService.updateMember(id, updates);
    set((state) => ({
      members: state.members.map((m) =>
        m.id === id ? normalizeMemberPaymentFields(updated) : m
      ),
    }));
  },

  loadMembers: async () => {
    try {
      const members = await memberService.getMembers();
      set({ members: members.map(normalizeMemberPaymentFields) });
    } catch (error) {
      console.error('Failed to load members:', error);
    }
  },

  saveMembers: async () => {
    // No-op: persistence is now handled by backend
  },

  reset: () => {
    set({ members: [] });
  },
}));
