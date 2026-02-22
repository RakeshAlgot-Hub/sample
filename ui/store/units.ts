import { create } from 'zustand';
import { unitService, UnitResponse } from '@/services/unitService';

interface UnitState {
  units: UnitResponse[];
  isLoading: boolean;
  error: string | null;
  fetchUnits: (propertyId: string) => Promise<void>;
  clearError: () => void;
}

export const useUnitStore = create<UnitState>((set) => ({
  units: [],
  isLoading: false,
  error: null,

  fetchUnits: async (propertyId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await unitService.getUnits(propertyId);
      set({ units: response.data, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch units';
      // Stop repeated requests on 403/429
      if (error.statusCode === 403 || error.statusCode === 429) {
        set({ isLoading: false, error: errorMessage });
        return;
      }
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  clear: () => {
    set({ units: [], isLoading: false, error: null });
  },
}));
