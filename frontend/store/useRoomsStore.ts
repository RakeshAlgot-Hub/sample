import { create } from 'zustand';
import { RoomSummary } from '@/services/roomService';
import * as roomService from '@/services/roomService';

interface RoomsStore {
  rooms: RoomSummary[];
  activeRoomId: string | null;
  loadRooms: (propertyId: string, buildingId: string, floorId: string) => Promise<void>;
  addRoom: (propertyId: string, buildingId: string, floorId: string, data: { name: string; shareType: string }) => Promise<void>;
  updateRoom: (propertyId: string, buildingId: string, floorId: string, roomId: string, data: { name?: string; shareType?: string }) => Promise<void>;
  removeRoom: (propertyId: string, buildingId: string, floorId: string, roomId: string) => Promise<void>;
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

  addRoom: async (propertyId, buildingId, floorId, data) => {
    const room = await roomService.createRoom(propertyId, buildingId, floorId, data);
    set((state) => ({
      rooms: [...state.rooms, room],
      activeRoomId: state.activeRoomId || room.id,
    }));
  },

  updateRoom: async (propertyId, buildingId, floorId, roomId, data) => {
    const room = await roomService.updateRoom(propertyId, buildingId, floorId, roomId, data);
    set((state) => ({
      rooms: state.rooms.map((r) => (r.id === roomId ? room : r)),
    }));
  },

  removeRoom: async (propertyId, buildingId, floorId, roomId) => {
    await roomService.deleteRoom(propertyId, buildingId, floorId, roomId);
    set((state) => {
      const rooms = state.rooms.filter((r) => r.id !== roomId);
      const activeRoomId = state.activeRoomId === roomId && rooms.length > 0 ? rooms[0].id : (state.activeRoomId === roomId ? null : state.activeRoomId);
      return { rooms, activeRoomId };
    });
  },

  setActiveRoom: (id) => {
    set({ activeRoomId: id });
  },

  reset: () => {
    set({ rooms: [], activeRoomId: null });
  },
}));
