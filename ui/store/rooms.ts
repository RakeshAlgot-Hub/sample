import { create } from 'zustand';
import { roomService, RoomResponse } from '@/services/roomService';
import { unitService, UnitResponse } from '@/services/unitService';

interface RoomState {
  rooms: RoomResponse[];
  isLoading: boolean;
  error: string | null;
  fetchRooms: (propertyId: string) => Promise<void>;
  addRoom: (
    propertyId: string,
    buildingId: string,
    roomNumber: string,
    floor: string,
    shareType: number
  ) => Promise<{ room: RoomResponse | null, status: number }>;
  deleteRoom: (roomId: string) => Promise<void>;
  clearError: () => void;
}

export const useRoomStore = create<RoomState>((set, get) => ({
  rooms: [],
  isLoading: false,
  error: null,

  fetchRooms: async (propertyId: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await roomService.getRooms(propertyId);
      set({ rooms: response.data, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch rooms';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  addRoom: async (
    propertyId: string,
    buildingId: string,
    roomNumber: string,
    floor: string,
    shareType: number
  ) => {
    set({ isLoading: true, error: null });
    try {
      const createdRoom = await roomService.createRoom({
        propertyId,
        buildingId,
        roomNumber,
        floor,
        shareType,
      });
      let units: UnitResponse[] = [];
      if (createdRoom && createdRoom.id) {
        try {
          units = await unitService.createUnits({
            propertyId,
            buildingId,
            floorId: floor,
            roomId: createdRoom.id,
            noOfBeds: shareType,
          });
        } catch (unitErr) {
          // Optionally handle unit creation error
          console.error('Failed to create units:', unitErr);
        }
      }
      set((state) => ({
        rooms: [...state.rooms, createdRoom],
        isLoading: false,
      }));
      return { room: createdRoom, status: 201 };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to add room';
      set({ isLoading: false, error: errorMessage });
      return { room: null, status: 0 };
    }
  },

  deleteRoom: async (roomId: string) => {
    set({ isLoading: true, error: null });

    try {
      await roomService.deleteRoom(roomId);

      set((state) => ({
        rooms: state.rooms.filter((r) => r.id !== roomId),
        isLoading: false,
      }));

      try {
        await unitService.deleteUnitsByRoom(roomId);
      } catch (error) {
        console.error('Failed to delete units:', error);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete room';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  clear: () => {
    set({ rooms: [], isLoading: false, error: null });
  },
}));
