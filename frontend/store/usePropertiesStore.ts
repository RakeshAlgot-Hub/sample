import { create } from 'zustand';
import { PropertySummary } from '@/types/property';
import * as propertyService from '@/services/propertyService';

interface PropertiesStore {
  properties: PropertySummary[];
  activePropertyId: string | null;
  addProperty: (data: { name: string; type: string; city: string; area: string }) => Promise<void>;
  removeProperty: (id: string) => Promise<void>;
  updateProperty: (id: string, updates: Partial<{ name: string; type: string; city: string; area: string }>) => Promise<void>;
  setActiveProperty: (id: string | null) => void;
  loadProperties: () => Promise<void>;
  reset: () => void;
}




export const usePropertiesStore = create<PropertiesStore>((set, get) => ({
  properties: [],
  activePropertyId: null,

  addProperty: async (data) => {
    const summary = await propertyService.createProperty(data);
    set((state) => ({
      properties: [...state.properties, summary],
      activePropertyId: state.activePropertyId || summary.id,
    }));
  },

  removeProperty: async (id) => {
    await propertyService.deleteProperty(id);
    set((state) => {
      const properties = state.properties.filter((p) => p.id !== id);
      const activePropertyId = state.activePropertyId === id && properties.length > 0 ? properties[0].id : (state.activePropertyId === id ? null : state.activePropertyId);
      return { properties, activePropertyId };
    });
  },

  updateProperty: async (id, updates) => {
    const summary = await propertyService.updateProperty(id, updates);
    set((state) => ({
      properties: state.properties.map((p) => (p.id === id ? summary : p)),
    }));
  },

  setActiveProperty: (id) => {
    set({ activePropertyId: id });
  },

  loadProperties: async () => {
    try {
      const summaries = await propertyService.getPropertySummaries();
      set({ properties: summaries });
      // Optionally set activePropertyId to first if not set
      set((state) => {
        if (!state.activePropertyId && summaries.length > 0) {
          return { activePropertyId: summaries[0].id };
        }
        if (state.activePropertyId && !summaries.some((p) => p.id === state.activePropertyId)) {
          return { activePropertyId: summaries.length > 0 ? summaries[0].id : null };
        }
        return {};
      });
    } catch (error) {
      console.error('Failed to load properties:', error);
    }
  },

  reset: () => {
    set({ properties: [], activePropertyId: null });
  },
}));
