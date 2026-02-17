import { create } from 'zustand';
import { PropertySummary } from '@/types/property';
import * as propertyService from '@/services/propertyService';

interface PropertiesStore {
  properties: PropertySummary[];
  activePropertyId: string | null;
  loading: boolean;
  error: string | null;
  addProperty: (data: { name: string; type: string; city: string; area: string }) => Promise<void>;
  updateProperty: (id: string, updates: Partial<{ name: string; type: string; city: string; area: string }>) => Promise<void>;
  removeProperty: (id: string) => Promise<void>;
  setActiveProperty: (id: string | null) => void;
  loadProperties: () => Promise<void>;
  reset: () => void;
}




export const usePropertiesStore = create<PropertiesStore>((set, get) => ({
  properties: [],
  activePropertyId: null,
  loading: false,
  error: null,

  addProperty: async (data) => {
    set({ loading: true, error: null });
    try {
      // Always pass buildings: [] to match backend API
      const summary = await propertyService.createProperty({ ...data, buildings: [] });
      set((state) => ({
        properties: [...state.properties, summary],
        activePropertyId: state.activePropertyId || summary.id,
        loading: false,
        error: null,
      }));
    } catch (err: any) {
      set({ loading: false, error: err?.message || 'Failed to create property' });
    }
  },

  updateProperty: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const summary = await propertyService.updateProperty(id, updates);
      set((state) => ({
        properties: state.properties.map((p) => (p.id === id ? summary : p)),
        loading: false,
        error: null,
      }));
    } catch (err: any) {
      set({ loading: false, error: err?.message || 'Failed to update property' });
    }
  },

  removeProperty: async (id) => {
    set({ loading: true, error: null });
    try {
      await propertyService.deleteProperty(id);
      set((state) => {
        const properties = state.properties.filter((p) => p.id !== id);
        const activePropertyId = state.activePropertyId === id && properties.length > 0 ? properties[0].id : (state.activePropertyId === id ? null : state.activePropertyId);
        return { properties, activePropertyId, loading: false, error: null };
      });
    } catch (err: any) {
      set({ loading: false, error: err?.message || 'Failed to delete property' });
    }
  },

  setActiveProperty: (id) => {
    set({ activePropertyId: id });
  },

  loadProperties: async () => {
    set({ loading: true, error: null });
    try {
      const summaries = await propertyService.getPropertySummaries();
      set({ properties: summaries, loading: false, error: null });
      // Overwrite activePropertyId if needed
      set((state) => {
        if (!state.activePropertyId && summaries.length > 0) {
          return { activePropertyId: summaries[0].id };
        }
        if (state.activePropertyId && !summaries.some((p) => p.id === state.activePropertyId)) {
          return { activePropertyId: summaries.length > 0 ? summaries[0].id : null };
        }
        return {};
      });
    } catch (err: any) {
      set({ loading: false, error: err?.message || 'Failed to load properties' });
    }
  },

  reset: () => {
    set({ properties: [], activePropertyId: null, loading: false, error: null });
  },
}));
