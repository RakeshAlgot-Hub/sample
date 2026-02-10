import { create } from 'zustand';
import * as bedService from '@/services/bedService';
import { Bed } from '@/types/property';

interface BedsStore {
  beds: Bed[];
  addBed: (bed: Bed) => Promise<void>;
  removeBed: (id: string) => Promise<void>;
  updateBed: (id: string, updates: Partial<Bed>) => Promise<void>;
  loadBeds: () => Promise<void>;
  reset: () => void;
}

export const useBedsStore = create<BedsStore>((set, get) => ({
  beds: [],

  addBed: async (bed: Bed) => {
    const created = await bedService.createBed(bed);
    set((state) => ({
      beds: [...state.beds, created as Bed],
    }));
  },

  removeBed: async (id: string) => {
    await bedService.deleteBed(id);
    set((state) => ({
      beds: state.beds.filter((b) => b.id !== id),
    }));
  },

  updateBed: async (id: string, updates: Partial<Bed>) => {
    const updated = await bedService.updateBed(id, updates);
    set((state) => ({
      beds: state.beds.map((b) =>
        b.id === id ? { ...b, ...(updated as object) } : b
      ),
    }));
  },

  loadBeds: async () => {
    try {
      const beds = await bedService.getBeds();
      set({ beds: beds as Bed[] });
    } catch (error) {
      console.error('Failed to load beds:', error);
    }
  },

  reset: () => {
    set({ beds: [] });
  },
}));
