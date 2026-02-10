import { create } from 'zustand';
import { Member } from '@/types/member';
import { usePropertiesStore } from './usePropertiesStore';
import { normalizeMemberPaymentFields } from '@/utils/memberPayments';
import { membersApi, CreateMemberInput } from '@/services/membersApi';

interface MembersStore {
  members: Member[];
  addMember: (member: CreateMemberInput) => Promise<Member>;
  removeMember: (id: string) => Promise<void>;
  updateMember: (id: string, updates: Partial<Member>) => Promise<void>;
  loadMembers: () => Promise<Member[]>;
  reset: () => void;
}

export const useMembersStore = create<MembersStore>((set, get) => ({
  members: [],

  addMember: async (member: CreateMemberInput) => {
    const created = await membersApi.create(member);
    const normalized = normalizeMemberPaymentFields(created);

    if (
      normalized.propertyId &&
      normalized.buildingId &&
      normalized.floorId &&
      normalized.roomId &&
      normalized.bedId
    ) {
      const { updateBedOccupancy } = usePropertiesStore.getState();
      await updateBedOccupancy(
        normalized.propertyId,
        normalized.buildingId,
        normalized.floorId,
        normalized.roomId,
        normalized.bedId,
        true
      );
    }

    set((state) => ({
      members: [...state.members, normalized],
    }));

    return normalized;
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

    await membersApi.remove(id);

    set((state) => ({
      members: state.members.filter((m) => m.id !== id),
    }));
  },

  updateMember: async (id: string, updates: Partial<Member>) => {
    const updated = await membersApi.update(id, updates);

    set((state) => ({
      members: state.members.map((m) =>
        m.id === id ? normalizeMemberPaymentFields(updated) : m
      ),
    }));
  },

  loadMembers: async () => {
    try {
      const members = await membersApi.getAll();
      const normalized = members.map(normalizeMemberPaymentFields);
      set({ members: normalized });
      return normalized;
    } catch (error) {
      console.error('Failed to load members:', error);
      set({ members: [] });
      return [];
    }
  },

  reset: () => {
    set({ members: [] });
  },
}));
