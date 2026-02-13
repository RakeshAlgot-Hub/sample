import { create } from 'zustand';
import { BuildingSummary } from '@/services/buildingService';
import * as buildingService from '@/services/buildingService';

interface BuildingsStore {
  buildings: BuildingSummary[];
  activeBuildingId: string | null;
  loadBuildings: (propertyId: string) => Promise<void>;
  addBuilding: (propertyId: string, data: { name: string }) => Promise<void>;
  updateBuilding: (propertyId: string, buildingId: string, data: { name?: string }) => Promise<void>;
  removeBuilding: (propertyId: string, buildingId: string) => Promise<void>;
  setActiveBuilding: (id: string | null) => void;
  reset: () => void;
}

export const useBuildingsStore = create<BuildingsStore>((set, get) => ({
  buildings: [],
  activeBuildingId: null,

  loadBuildings: async (propertyId) => {
    const buildings = await buildingService.getBuildingSummaries(propertyId);
    set({ buildings });
    set((state) => {
      if (!state.activeBuildingId && buildings.length > 0) {
        return { activeBuildingId: buildings[0].id };
      }
      if (state.activeBuildingId && !buildings.some((b) => b.id === state.activeBuildingId)) {
        return { activeBuildingId: buildings.length > 0 ? buildings[0].id : null };
      }
      return {};
    });
  },

  addBuilding: async (propertyId, data) => {
    const building = await buildingService.createBuilding(propertyId, data);
    set((state) => ({
      buildings: [...state.buildings, building],
      activeBuildingId: state.activeBuildingId || building.id,
    }));
  },

  updateBuilding: async (propertyId, buildingId, data) => {
    const building = await buildingService.updateBuilding(propertyId, buildingId, data);
    set((state) => ({
      buildings: state.buildings.map((b) => (b.id === buildingId ? building : b)),
    }));
  },

  removeBuilding: async (propertyId, buildingId) => {
    await buildingService.deleteBuilding(propertyId, buildingId);
    set((state) => {
      const buildings = state.buildings.filter((b) => b.id !== buildingId);
      const activeBuildingId = state.activeBuildingId === buildingId && buildings.length > 0 ? buildings[0].id : (state.activeBuildingId === buildingId ? null : state.activeBuildingId);
      return { buildings, activeBuildingId };
    });
  },

  setActiveBuilding: (id) => {
    set({ activeBuildingId: id });
  },

  reset: () => {
    set({ buildings: [], activeBuildingId: null });
  },
}));
