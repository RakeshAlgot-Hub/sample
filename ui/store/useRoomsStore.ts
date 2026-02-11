import { create } from 'zustand';
import * as roomService from '@/services/roomService';
import { Room } from '@/types/property';

interface RoomsStore {
  rooms: Room[];
  addRoom: (room: Room) => Promise<void>;
  removeRoom: (id: string) => Promise<void>;
  updateRoom: (id: string, updates: Partial<Room>) => Promise<void>;
  loadRooms: () => Promise<void>;
  reset: () => void;
}

export const useRoomsStore = create<RoomsStore>((set, get) => ({
  rooms: [],

  addRoom: async (room: Room) => {
    const created = await roomService.createRoom(room);
    set((state) => ({
      rooms: [...state.rooms, created as Room],
    }));
  },

  removeRoom: async (id: string) => {
    await roomService.deleteRoom(id);
    set((state) => ({
      rooms: state.rooms.filter((r) => r.id !== id),
    }));
  },

  updateRoom: async (id: string, updates: Partial<Room>) => {
    const updated = await roomService.updateRoom(id, updates);
    set((state) => ({
      rooms: state.rooms.map((r) =>
        r.id === id ? { ...r, ...(updated as object) } : r
      ),
    }));
  },

  loadRooms: async () => {
    try {
      const rooms = await roomService.getRooms();
      set({ rooms: rooms as Room[] });
    } catch (error) {
      console.error('Failed to load rooms:', error);
    }
  },

  reset: () => {
    set({ rooms: [] });
  },
}));
