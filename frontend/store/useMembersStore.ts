import { create } from 'zustand';
import { Member } from '@/types/member';
import { normalizeMemberPaymentFields } from '@/utils/memberPayments';


interface MembersStore {
  membersById: Record<string, Member>;
  memberIds: string[];
  /**
   * Computed array of members for UI compatibility (do not mutate directly)
   */
  members: Member[];
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  removeMember: (id: string) => Promise<void>;
  updateMember: (id: string, updates: Partial<Member>) => Promise<void>;
  loadMembersByProperty: (propertyId: string, page?: number, limit?: number) => Promise<void>;
  clearMembers: () => void;
  reset: () => void;
}

export const useMembersStore = create<MembersStore>((set, get) => ({
  membersById: {},
  memberIds: [],
  get members() {
    // Always return members in the order of memberIds
    return this.memberIds.map((id) => this.membersById[id]).filter(Boolean);
  },
  page: 1,
  hasMore: true,
  isLoading: false,

  removeMember: async (id: string) => {
    set((state) => {
      const { [id]: _, ...rest } = state.membersById;
      return {
        membersById: rest,
        memberIds: state.memberIds.filter((mid) => mid !== id),
      };
    });
  },

  updateMember: async (id: string, updates: Partial<Member>) => {
    set((state) => ({
      membersById: {
        ...state.membersById,
        [id]: normalizeMemberPaymentFields({ ...state.membersById[id], ...updates }),
      },
    }));
  },

  loadMembersByProperty: async (propertyId: string, page = 1, limit = 20) => {
    set({ isLoading: true });
    try {
      // Replace with actual backend API call
      const response = await fetch(`/api/members?propertyId=${propertyId}&page=${page}&limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch members');
      const { members, hasMore } = await response.json();
      const normalized: Record<string, Member> = {};
      const ids: string[] = [];
      for (const m of members) {
        normalized[m.id] = m;
        ids.push(m.id);
      }
      set((state) => ({
        membersById: page === 1 ? normalized : { ...state.membersById, ...normalized },
        memberIds: page === 1 ? ids : [...state.memberIds, ...ids],
        page,
        hasMore,
        isLoading: false,
      }));
    } catch (e) {
      set({ isLoading: false });
      // Optionally handle error
    }
  },

  clearMembers: () => {
    set({ membersById: {}, memberIds: [], page: 1, hasMore: true });
  },

  reset: () => {
    set({ membersById: {}, memberIds: [], page: 1, hasMore: true });
  },
}));
