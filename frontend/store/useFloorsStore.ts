import { create } from 'zustand';
import { FloorSummary } from '@/services/floorService';
import * as floorService from '@/services/floorService';

interface FloorsStore {
  floors: FloorSummary[];
  activeFloorId: string | null;
  loadFloors: (propertyId: string, buildingId: string) => Promise<void>;
  addFloor: (propertyId: string, buildingId: string, data: { name: string }) => Promise<void>;
  updateFloor: (propertyId: string, buildingId: string, floorId: string, data: { name?: string }) => Promise<void>;
  removeFloor: (propertyId: string, buildingId: string, floorId: string) => Promise<void>;
  setActiveFloor: (id: string | null) => void;
  reset: () => void;
}

export const useFloorsStore = create<FloorsStore>((set, get) => ({
  floors: [],
  activeFloorId: null,

  loadFloors: async (propertyId, buildingId) => {
    const floors = await floorService.getFloorSummaries(propertyId, buildingId);
    set({ floors });
    set((state) => {
      if (!state.activeFloorId && floors.length > 0) {
        return { activeFloorId: floors[0].id };
      }
      if (state.activeFloorId && !floors.some((f) => f.id === state.activeFloorId)) {
        return { activeFloorId: floors.length > 0 ? floors[0].id : null };
      }
      return {};
    });
  },

  addFloor: async (propertyId, buildingId, data) => {
    const floor = await floorService.createFloor(propertyId, buildingId, data);
    set((state) => ({
      floors: [...state.floors, floor],
      activeFloorId: state.activeFloorId || floor.id,
    }));
  },

  updateFloor: async (propertyId, buildingId, floorId, data) => {
    const floor = await floorService.updateFloor(propertyId, buildingId, floorId, data);
    set((state) => ({
      floors: state.floors.map((f) => (f.id === floorId ? floor : f)),
    }));
  },

  removeFloor: async (propertyId, buildingId, floorId) => {
    await floorService.deleteFloor(propertyId, buildingId, floorId);
    set((state) => {
      const floors = state.floors.filter((f) => f.id !== floorId);
      const activeFloorId = state.activeFloorId === floorId && floors.length > 0 ? floors[0].id : (state.activeFloorId === floorId ? null : state.activeFloorId);
      return { floors, activeFloorId };
    });
  },

  setActiveFloor: (id) => {
    set({ activeFloorId: id });
  },

  reset: () => {
    set({ floors: [], activeFloorId: null });
  },
}));
