import { create } from 'zustand';
import { RoomSummary } from '@/services/roomService';
import * as roomService from '@/services/roomService';

interface RoomsStore {
  rooms: RoomSummary[];
  activeRoomId: string | null;
  loadRooms: (propertyId: string, buildingId: string, floorId: string) => Promise<void>;
  setActiveRoom: (id: string | null) => void;
  reset: () => void;
}

export const useRoomsStore = create<RoomsStore>((set, get) => ({
  rooms: [],
  activeRoomId: null,

  loadRooms: async (propertyId, buildingId, floorId) => {
    const rooms = await roomService.getRoomSummaries(propertyId, buildingId, floorId);
    set({ rooms });
    set((state) => {
      if (!state.activeRoomId && rooms.length > 0) {
        return { activeRoomId: rooms[0].id };
      }
      if (state.activeRoomId && !rooms.some((r) => r.id === state.activeRoomId)) {
        return { activeRoomId: rooms.length > 0 ? rooms[0].id : null };
      }
      return {};
    });
  },


  setActiveRoom: (id) => {
    set({ activeRoomId: id });
  },

  reset: () => {
    set({ rooms: [], activeRoomId: null });
  },
}));
